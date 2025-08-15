"""
Rule Review Service for Scan-Rule-Sets Group
===========================================

Advanced rule review and approval workflow service providing comprehensive
review management, approval processes, and collaborative feedback systems.

Features:
- Multi-stage review workflows with configurable approval processes
- Advanced review metrics and quality scoring
- AI-powered review recommendations and quality assessment
- Collaborative review sessions with real-time feedback
- Comprehensive review analytics and reporting
- Integration with version control and change management
- Advanced notification and escalation systems
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
import statistics
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, update
from sqlalchemy.orm import selectinload

from app.db_session import get_db_session
from app.models.Scan_Rule_Sets_completed_models.enhanced_collaboration_models import (
    EnhancedRuleReview, EnhancedRuleComment, ReviewType, RuleTeamMember, TeamCollaborationHub
)
from app.models.Scan_Rule_Sets_completed_models.advanced_collaboration_models import (
    ApprovalWorkflow, ReviewStatus,
    ReviewCreateRequest, CommentCreateRequest
)
from app.models.Scan_Rule_Sets_completed_models.rule_template_models import RuleTemplate
from app.models.Scan_Rule_Sets_completed_models.rule_version_control_models import RuleVersion, ApprovalStatus
from app.core.logging_config import get_logger
from app.utils.cache import cache_result
from app.utils.rate_limiter import check_rate_limit
from app.models.auth_models import User
from app.services.notification_service import NotificationService

logger = get_logger(__name__)

class RuleReviewService:
    """
    Advanced rule review service with comprehensive review management,
    approval workflows, and collaborative feedback systems.
    """

    def __init__(self):
        self.review_metrics_cache = {}
        self.ai_review_models = {}
        self.notification_handlers = []

    # ===================== REVIEW MANAGEMENT =====================

    async def create_review(
        self,
        review_request: ReviewCreateRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession = None
    ) -> EnhancedRuleReview:
        """
        Create a new rule review with comprehensive workflow setup.
        """
        if db is None:
            async with get_db_session() as db:
                return await self._create_review_internal(review_request, current_user_id, db)
        return await self._create_review_internal(review_request, current_user_id, db)

    async def _create_review_internal(
        self,
        review_request: ReviewCreateRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession
    ) -> EnhancedRuleReview:
        """Internal method to create a rule review."""
        try:
            # Validate rule exists
            rule_query = select(RuleTemplate).where(RuleTemplate.id == review_request.rule_id)
            rule_result = await db.execute(rule_query)
            rule = rule_result.scalar_one_or_none()
            
            if not rule:
                raise ValueError(f"Rule with ID {review_request.rule_id} not found")

            # Create review instance
            review = EnhancedRuleReview(
                rule_id=review_request.rule_id,
                review_type=review_request.review_type,
                reviewer_id=review_request.reviewer_id or current_user_id,
                requested_by=current_user_id,
                priority=review_request.priority,
                deadline=review_request.deadline,
                review_scope=review_request.review_scope,
                review_criteria=review_request.review_criteria,
                auto_assignment_enabled=review_request.auto_assignment_enabled,
                notification_settings=review_request.notification_settings,
                tags=review_request.tags,
                metadata=review_request.metadata
            )

            # Auto-assign reviewers if enabled
            if review_request.auto_assignment_enabled:
                await self._auto_assign_reviewers(review, rule, db)

            # Set up approval workflow if required
            if review_request.review_type in [ReviewType.APPROVAL_REQUIRED, ReviewType.COMPLIANCE_CHECK]:
                await self._setup_approval_workflow(review, rule, db)

            db.add(review)
            await db.commit()
            await db.refresh(review)

            # Send notifications
            await self._send_review_notifications(review, "created", db)

            logger.info(f"Created rule review {review.id} for rule {review_request.rule_id}")

            return review

        except Exception as e:
            logger.error(f"Error creating rule review: {str(e)}")
            await db.rollback()
            raise

    async def get_review(
        self,
        review_id: uuid.UUID,
        db: AsyncSession = None
    ) -> Optional[EnhancedRuleReview]:
        """Get detailed review information."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_review_internal(review_id, db)
        return await self._get_review_internal(review_id, db)

    async def _get_review_internal(
        self,
        review_id: uuid.UUID,
        db: AsyncSession
    ) -> Optional[EnhancedRuleReview]:
        """Internal method to get review details."""
        try:
            query = (
                        select(EnhancedRuleReview)
        .options(
            selectinload(EnhancedRuleReview.comments),
            selectinload(EnhancedRuleReview.approval_workflow)
        )
        .where(EnhancedRuleReview.id == review_id)
            )
            
            result = await db.execute(query)
            review = result.scalar_one_or_none()
            
            if not review:
                return None

            return review

        except Exception as e:
            logger.error(f"Error getting rule review {review_id}: {str(e)}")
            raise

    async def update_review_status(
        self,
        review_id: uuid.UUID,
        new_status: ReviewStatus,
        notes: Optional[str] = None,
        current_user_id: Optional[uuid.UUID] = None,
        db: AsyncSession = None
    ) -> EnhancedRuleReview:
        """Update review status with comprehensive validation and notifications."""
        if db is None:
            async with get_db_session() as db:
                return await self._update_review_status_internal(
                    review_id, new_status, notes, current_user_id, db
                )
        return await self._update_review_status_internal(
            review_id, new_status, notes, current_user_id, db
        )

    async def _update_review_status_internal(
        self,
        review_id: uuid.UUID,
        new_status: ReviewStatus,
        notes: Optional[str],
        current_user_id: Optional[uuid.UUID],
        db: AsyncSession
    ) -> EnhancedRuleReview:
        """Internal method to update review status."""
        try:
            # Get current review
            query = select(EnhancedRuleReview).where(EnhancedRuleReview.id == review_id)
            result = await db.execute(query)
            review = result.scalar_one_or_none()
            
            if not review:
                raise ValueError(f"Review with ID {review_id} not found")

            # Validate status transition
            await self._validate_status_transition(review, new_status)

            # Update review
            old_status = review.status
            review.status = new_status
            review.updated_at = datetime.utcnow()
            
            if notes:
                review.review_notes = review.review_notes or []
                review.review_notes.append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "user_id": str(current_user_id) if current_user_id else None,
                    "note": notes,
                    "status_change": f"{old_status} -> {new_status}"
                })

            # Update progress based on status
            await self._update_review_progress(review)

            # Handle status-specific actions
            if new_status == ReviewStatus.APPROVED:
                await self._handle_review_approval(review, db)
            elif new_status == ReviewStatus.REJECTED:
                await self._handle_review_rejection(review, db)
            elif new_status == ReviewStatus.COMPLETED:
                await self._handle_review_completion(review, db)

            await db.commit()
            await db.refresh(review)

            # Send notifications
            await self._send_review_notifications(review, "status_updated", db)

            logger.info(f"Updated review {review_id} status to {new_status}")

            return review

        except Exception as e:
            logger.error(f"Error updating review status: {str(e)}")
            await db.rollback()
            raise

    # ===================== COMMENT MANAGEMENT =====================

    async def add_comment(
        self,
        comment_request: CommentCreateRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession = None
    ) -> EnhancedRuleComment:
        """Add a comment to a review with comprehensive threading and notifications."""
        if db is None:
            async with get_db_session() as db:
                return await self._add_comment_internal(comment_request, current_user_id, db)
        return await self._add_comment_internal(comment_request, current_user_id, db)

    async def _add_comment_internal(
        self,
        comment_request: CommentCreateRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession
    ) -> EnhancedRuleComment:
        """Internal method to add a comment."""
        try:
            # Validate review exists
            review_query = select(EnhancedRuleReview).where(EnhancedRuleReview.id == comment_request.review_id)
            review_result = await db.execute(review_query)
            review = review_result.scalar_one_or_none()
            
            if not review:
                raise ValueError(f"Review with ID {comment_request.review_id} not found")

            # Create comment
            comment = EnhancedRuleComment(
                review_id=comment_request.review_id,
                author_id=current_user_id,
                comment_text=comment_request.comment_text,
                comment_type=comment_request.comment_type,
                parent_comment_id=comment_request.parent_comment_id,
                referenced_line=comment_request.referenced_line,
                referenced_section=comment_request.referenced_section,
                severity=comment_request.severity,
                is_resolved=False,
                attachments=comment_request.attachments,
                mentions=comment_request.mentions,
                tags=comment_request.tags,
                metadata=comment_request.metadata
            )

            db.add(comment)
            await db.commit()
            await db.refresh(comment)

            # Update review activity
            await self._update_review_activity(review, "comment_added", db)

            # Send notifications for mentions
            if comment_request.mentions:
                await self._send_mention_notifications(comment, db)

            logger.info(f"Added comment {comment.id} to review {comment_request.review_id}")

            return comment

        except Exception as e:
            logger.error(f"Error adding comment: {str(e)}")
            await db.rollback()
            raise

    async def resolve_comment(
        self,
        comment_id: uuid.UUID,
        resolution_notes: Optional[str] = None,
        current_user_id: Optional[uuid.UUID] = None,
        db: AsyncSession = None
    ) -> EnhancedRuleComment:
        """Resolve a comment with comprehensive tracking."""
        if db is None:
            async with get_db_session() as db:
                return await self._resolve_comment_internal(
                    comment_id, resolution_notes, current_user_id, db
                )
        return await self._resolve_comment_internal(
            comment_id, resolution_notes, current_user_id, db
        )

    async def _resolve_comment_internal(
        self,
        comment_id: uuid.UUID,
        resolution_notes: Optional[str],
        current_user_id: Optional[uuid.UUID],
        db: AsyncSession
    ) -> EnhancedRuleComment:
        """Internal method to resolve a comment with comprehensive tracking."""
        try:
            # Get current comment
            query = select(EnhancedRuleComment).where(EnhancedRuleComment.id == comment_id)
            result = await db.execute(query)
            comment = result.scalar_one_or_none()
            
            if not comment:
                raise ValueError(f"Comment with ID {comment_id} not found")

            # Update comment resolution status
            comment.is_resolved = True
            comment.resolved_at = datetime.utcnow()
            comment.resolved_by = current_user_id
            comment.resolution_notes = resolution_notes
            comment.updated_at = datetime.utcnow()

            # Update review activity
            review_query = select(EnhancedRuleReview).where(EnhancedRuleReview.id == comment.review_id)
            review_result = await db.execute(review_query)
            review = review_result.scalar_one_or_none()
            
            if review:
                await self._update_review_activity(review, "comment_resolved", db)

            await db.commit()
            await db.refresh(comment)

            # Send notifications
            await self._send_comment_resolution_notifications(comment, db)

            logger.info(f"Resolved comment {comment_id}")

            return comment

        except Exception as e:
            logger.error(f"Error resolving comment {comment_id}: {str(e)}")
            await db.rollback()
            raise

    # ===================== REVIEW ANALYTICS =====================

    @cache_result(ttl=300)  # 5 minutes
    async def get_review_metrics(
        self,
        rule_id: Optional[uuid.UUID] = None,
        reviewer_id: Optional[uuid.UUID] = None,
        date_range: Optional[Tuple[datetime, datetime]] = None,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Get comprehensive review metrics and analytics."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_review_metrics_internal(
                    rule_id, reviewer_id, date_range, db
                )
        return await self._get_review_metrics_internal(
            rule_id, reviewer_id, date_range, db
        )

    async def _get_review_metrics_internal(
        self,
        rule_id: Optional[uuid.UUID],
        reviewer_id: Optional[uuid.UUID],
        date_range: Optional[Tuple[datetime, datetime]],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Internal method to get review metrics."""
        try:
            # Build base query
            query = select(EnhancedRuleReview)
            
            if rule_id:
                query = query.where(EnhancedRuleReview.rule_id == rule_id)
            if reviewer_id:
                query = query.where(EnhancedRuleReview.reviewer_id == reviewer_id)
            if date_range:
                start_date, end_date = date_range
                query = query.where(
                    and_(
                        EnhancedRuleReview.created_at >= start_date,
                        EnhancedRuleReview.created_at <= end_date
                    )
                )

            # Execute query
            result = await db.execute(query)
            reviews = result.scalars().all()

            # Calculate metrics
            total_reviews = len(reviews)
            completed_reviews = len([r for r in reviews if r.status == ReviewStatus.COMPLETED])
            approved_reviews = len([r for r in reviews if r.status == ReviewStatus.APPROVED])
            rejected_reviews = len([r for r in reviews if r.status == ReviewStatus.REJECTED])
            
            avg_review_time = 0
            avg_quality_score = 0
            
            if reviews:
                completed = [r for r in reviews if r.completed_at]
                if completed:
                    total_time = sum(
                        (r.completed_at - r.created_at).total_seconds() / 3600
                        for r in completed
                    )
                    avg_review_time = total_time / len(completed)
                
                quality_scores = [r.quality_score for r in reviews if r.quality_score]
                if quality_scores:
                    avg_quality_score = sum(quality_scores) / len(quality_scores)

            # Review type distribution
            type_distribution = {}
            for review in reviews:
                review_type = review.review_type.value
                type_distribution[review_type] = type_distribution.get(review_type, 0) + 1

            # Priority distribution
            priority_distribution = {}
            for review in reviews:
                priority = review.priority.value
                priority_distribution[priority] = priority_distribution.get(priority, 0) + 1

            return {
                "total_reviews": total_reviews,
                "completed_reviews": completed_reviews,
                "approved_reviews": approved_reviews,
                "rejected_reviews": rejected_reviews,
                "completion_rate": completed_reviews / total_reviews if total_reviews > 0 else 0,
                "approval_rate": approved_reviews / completed_reviews if completed_reviews > 0 else 0,
                "avg_review_time_hours": avg_review_time,
                "avg_quality_score": avg_quality_score,
                "type_distribution": type_distribution,
                "priority_distribution": priority_distribution,
                "calculated_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error calculating review metrics: {str(e)}")
            raise

    # ===================== AI-POWERED FEATURES =====================

    async def get_ai_review_recommendations(
        self,
        rule_id: uuid.UUID,
        review_type: ReviewType,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Get AI-powered review recommendations based on rule analysis."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_ai_review_recommendations_internal(
                    rule_id, review_type, db
                )
        return await self._get_ai_review_recommendations_internal(
            rule_id, review_type, db
        )

    async def _get_ai_review_recommendations_internal(
        self,
        rule_id: uuid.UUID,
        review_type: ReviewType,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Internal method for AI review recommendations."""
        try:
            # Get rule details
            rule_query = select(RuleTemplate).where(RuleTemplate.id == rule_id)
            rule_result = await db.execute(rule_query)
            rule = rule_result.scalar_one_or_none()
            
            if not rule:
                raise ValueError(f"Rule with ID {rule_id} not found")

            # Get historical review data
            history_query = (
                        select(EnhancedRuleReview)
        .where(
            and_(
                EnhancedRuleReview.rule_id == rule_id,
                EnhancedRuleReview.status.in_([ReviewStatus.COMPLETED, ReviewStatus.APPROVED])
            )
        )
        .order_by(desc(EnhancedRuleReview.created_at))
                .limit(10)
            )
            
            history_result = await db.execute(history_query)
            historical_reviews = history_result.scalars().all()

            # AI analysis would go here - using mock logic for now
            recommendations = {
                "suggested_reviewers": await self._suggest_reviewers(rule, review_type, db),
                "estimated_review_time": await self._estimate_review_time(rule, review_type, historical_reviews),
                "complexity_score": await self._calculate_complexity_score(rule),
                "focus_areas": await self._identify_focus_areas(rule, review_type),
                "similar_rules": await self._find_similar_rules(rule, db),
                "potential_issues": await self._predict_potential_issues(rule, historical_reviews),
                "quality_checklist": await self._generate_quality_checklist(rule, review_type)
            }

            return recommendations

        except Exception as e:
            logger.error(f"Error getting AI review recommendations: {str(e)}")
            raise

    # ===================== HELPER METHODS =====================

    async def _auto_assign_reviewers(
        self,
        review: EnhancedRuleReview,
        rule: RuleTemplate,
        db: AsyncSession
    ) -> None:
        """Auto-assign reviewers based on expertise, availability, and historical performance."""
        try:
            # Derive expertise tags from rule metadata
            expertise_tags = set((rule.category or '').split(','))
            expertise_tags.update(rule.keywords or [])
            expertise_tags.update(rule.regulatory_tags or [])
            expertise_tags.update(rule.industry_tags or [])

            # Fetch candidate members within the collaboration hub
            candidates_query = (
                select(RuleTeamMember)
                .where(RuleTeamMember.hub_id == review.collaboration_hub_id)
            )
            candidates_result = await db.execute(candidates_query)
            candidates: List[RuleTeamMember] = candidates_result.scalars().all()

            if not candidates:
                logger.warning("No team members found for auto-assignment")
                return

            def compute_candidate_score(member: RuleTeamMember) -> float:
                # Expertise match
                member_expertise = set(member.expertise_domains or []) if hasattr(member, 'expertise_domains') else set()
                member_expertise.update(member.expertise_areas or [])
                expertise_match = len(expertise_tags.intersection(member_expertise)) / float(len(expertise_tags) or 1)

                # Availability (lower assigned workload is better)
                workload_limit = getattr(member, 'workload_limit', 10) or 10
                current_assignments = getattr(member, 'active_assignments', 0) or 0
                availability_score = max(0.0, 1.0 - (current_assignments / float(workload_limit)))

                # Historical performance
                perf = (member.performance or {}).copy() if hasattr(member, 'performance') else {}
                quality = float(perf.get('quality', 0.8))
                timeliness = float(perf.get('timeliness', 0.8))
                reliability = float(perf.get('reliability', 0.8))
                performance_score = (quality + timeliness + reliability) / 3.0

                # Recency boost
                recency_score = 1.0
                if getattr(member, 'last_active', None):
                    recency_score = 1.0

                # Aggregate score
                return 0.5 * expertise_match + 0.3 * availability_score + 0.2 * performance_score * recency_score

            ranked = sorted(candidates, key=compute_candidate_score, reverse=True)
            needed = max(1, review.required_reviewers)
            assigned = []

            for member in ranked[:needed]:
                assigned.append(str(member.member_id))

            review.assigned_reviewers = assigned
            review.current_reviewers = len(assigned)
            review.auto_assigned = True

        except Exception as e:
            logger.warning(f"Auto-assignment failed: {e}")

    async def _setup_approval_workflow(
        self,
        review: EnhancedRuleReview,
        rule: RuleTemplate,
        db: AsyncSession
    ) -> None:
        """Set up multi-stage approval workflow based on review type and rule category."""
        try:
            stages: List[Dict[str, Any]] = []
            # Base stages
            stages.append({"name": "technical_review", "approvers": review.assigned_reviewers or [], "required": True})
            # Compliance/security stages as needed
            if rule.category in ("compliance", "security") or review.review_type in (getattr(ReviewType, 'COMPLIANCE', None), getattr(ReviewType, 'SECURITY', None)):
                stages.append({"name": "compliance_review", "approvers": [], "required": True})
                stages.append({"name": "security_review", "approvers": [], "required": True})
            # Final approval
            stages.append({"name": "final_approval", "approvers": [review.requested_by], "required": True})

            workflow = ApprovalWorkflow(
                workflow_name=f"Review {review.review_id} Workflow",
                workflow_description="Automated multi-stage approval for rule review",
                workflow_type="sequential",
                approval_stages=stages,
                current_stage=0,
                total_stages=len(stages),
                status=getattr(type(ApprovalWorkflow).status.type.python_type, '__members__', {}).get('ACTIVE') if hasattr(ApprovalWorkflow, 'status') else None,
                initiator=review.requested_by,
                approvers={str(idx): {"stage": s["name"], "approvers": s.get("approvers", [])} for idx, s in enumerate(stages)},
                current_approvers=stages[0].get("approvers", []),
                rule_id=int(review.rule_id) if isinstance(review.rule_id, str) and review.rule_id.isdigit() else None,
                review_id=review.review_id
            )

            db.add(workflow)
            await db.flush()
            review.stage = stages[0]["name"]

        except Exception as e:
            logger.warning(f"Approval workflow setup failed: {e}")

    async def _validate_status_transition(
        self,
        review: EnhancedRuleReview,
        new_status: ReviewStatus
    ) -> None:
        """Validate if status transition is allowed according to enterprise workflow rules."""
        allowed: Dict[str, List[str]] = {
            "pending": ["in_progress", "cancelled"],
            "in_progress": ["review_required", "revision_needed", "approved", "rejected", "cancelled"],
            "review_required": ["approved", "rejected", "revision_needed", "cancelled"],
            "revision_needed": ["in_progress", "cancelled"],
            "approved": ["completed"],
            "rejected": ["completed"],
            "completed": [],
            "cancelled": []
        }
        current = (review.status or "pending").lower()
        target = (new_status.value if hasattr(new_status, 'value') else str(new_status)).lower()
        if target not in allowed.get(current, []):
            raise ValueError(f"Invalid status transition: {current} -> {target}")

    async def _update_review_progress(self, review: EnhancedRuleReview) -> None:
        """Update review progress percentage based on status and completion."""
        status_progress = {
            ReviewStatus.PENDING: 0,
            ReviewStatus.IN_PROGRESS: 25,
            ReviewStatus.REVIEW_REQUIRED: 50,
            ReviewStatus.REVISION_NEEDED: 40,
            ReviewStatus.APPROVED: 100,
            ReviewStatus.REJECTED: 100,
            ReviewStatus.COMPLETED: 100,
            ReviewStatus.CANCELLED: 0
        }
        
        review.progress_percentage = status_progress.get(review.status, 0)

    async def _send_review_notifications(
        self,
        review: EnhancedRuleReview,
        request_type: str,
        db: AsyncSession
    ) -> None:
        """Send review notifications to relevant stakeholders via NotificationService."""
        try:
            notifier = NotificationService()
            recipients: List[str] = []

            # Collect recipient emails from assigned reviewers and requester
            user_ids: List[str] = []
            user_ids.extend(review.assigned_reviewers or [])
            if review.requested_by:
                user_ids.append(review.requested_by)
            if review.approved_by:
                user_ids.append(review.approved_by)

            if user_ids:
                users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
                users = users_result.scalars().all()
                recipients = [u.email for u in users if getattr(u, 'email', None)]

            title = f"Rule Review {request_type.replace('_', ' ').title()}"
            message = f"Review {review.review_id} for rule {review.rule_id} is now {review.status}. Stage: {review.stage}."
            priority = "high" if review.priority in ("high", "critical") else "normal"
            await notifier.send_notification(
                notification_type="rule_review",
                message=message,
                recipients=recipients,
                priority=priority,
                metadata={
                    "title": title,
                    "review_id": review.review_id,
                    "status": review.status,
                    "stage": review.stage
                }
            )
        except Exception as e:
            logger.warning(f"Notification dispatch failed: {e}")

    async def _suggest_reviewers(
        self,
        rule: RuleTemplate,
        review_type: ReviewType,
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Suggest optimal reviewers based on expertise, availability, and performance metrics."""
        # Prefer members from the same hub and with matching expertise
        try:
            # Build expertise tags
            expertise_tags = set((rule.category or '').split(','))
            expertise_tags.update(rule.keywords or [])
            expertise_tags.update(rule.regulatory_tags or [])
            expertise_tags.update(rule.industry_tags or [])

            # Find hubs referencing this rule id (if any). If not available, scan all hubs.
            hubs_result = await db.execute(select(TeamCollaborationHub).limit(1))
            hubs = hubs_result.scalars().all()

            members: List[RuleTeamMember] = []
            if hubs:
                mem_result = await db.execute(select(RuleTeamMember).where(RuleTeamMember.hub_id == hubs[0].hub_id))
                members = mem_result.scalars().all()
            else:
                mem_result = await db.execute(select(RuleTeamMember))
                members = mem_result.scalars().all()

            suggestions: List[Dict[str, Any]] = []
            for m in members:
                member_expertise = set(m.expertise_areas or [])
                match = len(expertise_tags.intersection(member_expertise)) / float(len(expertise_tags) or 1)
                availability = 1.0
                if getattr(m, 'workload_limit', None) is not None:
                    cur = getattr(m, 'active_assignments', 0) or 0
                    availability = max(0.0, 1.0 - (cur / float(m.workload_limit or 1)))
                perf = (m.performance or {}).copy() if hasattr(m, 'performance') else {}
                perf_score = float(perf.get('quality', 0.85))
                overall = 0.5 * match + 0.3 * availability + 0.2 * perf_score
                suggestions.append({
                    "user_id": str(m.user_id),
                    "expertise_score": round(match, 3),
                    "availability_score": round(availability, 3),
                    "overall_score": round(overall, 3)
                })

            suggestions.sort(key=lambda s: s["overall_score"], reverse=True)
            return suggestions[:5]
        except Exception as e:
            logger.warning(f"Reviewer suggestion failed: {e}")
            return []

    async def _estimate_review_time(
        self,
        rule: RuleTemplate,
        review_type: ReviewType,
        historical_reviews: List[EnhancedRuleReview]
    ) -> Dict[str, Any]:
        """Estimate review time using historical durations and complexity-aware adjustments."""
        try:
            durations = []
            for r in historical_reviews:
                if r.completed_at and r.created_at:
                    hours = (r.completed_at - r.created_at).total_seconds() / 3600.0
                    if hours > 0:
                        durations.append(hours)
            hist_avg = statistics.mean(durations) if durations else 2.0
            hist_std = statistics.pstdev(durations) if len(durations) > 1 else 0.5

            # Complexity factor from template
            base_complexity = 1.0
            complexity_map = {
                "beginner": 0.7, "intermediate": 1.0, "advanced": 1.2, "expert": 1.4, "enterprise": 1.6
            }
            level = (str(rule.complexity_level or "intermediate")).lower()
            base_complexity = complexity_map.get(level, 1.0)

            # Structural complexity: parameters + validations + dependencies
            structural_complexity = 1.0 + 0.02 * len(rule.parameter_definitions or []) + 0.03 * len(rule.validation_rules or []) + 0.01 * len(rule.required_templates or [])
            estimated = hist_avg * base_complexity * structural_complexity

            # Confidence inversely related to std dev
            confidence = 1.0 / (1.0 + (hist_std / (hist_avg + 1e-6)))
            confidence = float(max(0.5, min(0.95, confidence)))

            return {"estimated_hours": round(estimated, 2), "confidence": round(confidence, 3), "factors": ["historical_avg", "complexity_level", "structural_complexity"]}
        except Exception as e:
            logger.warning(f"Estimate review time failed: {e}")
            return {"estimated_hours": 4.0, "confidence": 0.7, "factors": ["fallback"]}

    async def _calculate_complexity_score(self, rule: RuleTemplate) -> float:
        """Calculate rule complexity score based on template metadata and structure."""
        try:
            # Base from declared complexity level
            base_map = {"beginner": 0.2, "intermediate": 0.45, "advanced": 0.65, "expert": 0.8, "enterprise": 0.9}
            level = (str(rule.complexity_level or "intermediate")).lower()
            base = base_map.get(level, 0.5)

            # Structural metrics
            num_params = len(rule.parameter_definitions or [])
            num_validations = len(rule.validation_rules or [])
            num_dependencies = len(rule.required_templates or []) + len(rule.optional_templates or [])
            schema_size = len((rule.template_schema or {}).keys())
            content_nodes = len((rule.template_content or {}).keys())

            structural = min(1.0, 0.02 * num_params + 0.03 * num_validations + 0.015 * num_dependencies + 0.005 * (schema_size + content_nodes))

            # Historical performance penalties (if available)
            perf = rule.performance_metrics or {}
            failure_penalty = 0.0
            if perf:
                error_rate = max(0.0, float(perf.get("error_rate", 0.0)))
                failure_penalty = min(0.2, error_rate * 0.2)

            score = max(0.0, min(1.0, base + structural + failure_penalty))
            return float(round(score, 3))
        except Exception as e:
            logger.warning(f"Complexity scoring failed: {e}")
            return 0.6

    async def _update_review_activity(
        self,
        review: EnhancedRuleReview,
        activity_type: str,
        db: AsyncSession
    ) -> None:
        """Update review activity tracking for analytics and notifications."""
        try:
            # Update review activity metrics
            if not hasattr(review, 'activity_log'):
                review.activity_log = []
            
            activity_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "activity_type": activity_type,
                "metadata": {}
            }
            
            review.activity_log.append(activity_entry)
            
            # Update last activity timestamp
            review.last_activity_at = datetime.utcnow()
            
        except Exception as e:
            logger.warning(f"Error updating review activity: {str(e)}")

    async def _send_mention_notifications(
        self,
        comment: EnhancedRuleComment,
        db: AsyncSession
    ) -> None:
        """Send notifications for user mentions in comments."""
        try:
            notifier = NotificationService()
            user_ids = comment.mentions or []
            if not user_ids:
                return
            users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
            users = users_result.scalars().all()
            recipients = [u.email for u in users if getattr(u, 'email', None)]
            if not recipients:
                return
            await notifier.send_notification(
                notification_type="mention",
                message=f"You were mentioned in a review comment: {comment.comment_id}",
                recipients=recipients,
                priority="normal",
                metadata={"title": "You were mentioned", "review_id": comment.review_id or "", "comment_id": comment.comment_id}
            )
        except Exception as e:
            logger.warning(f"Error sending mention notifications: {str(e)}")

    async def _send_comment_resolution_notifications(
        self,
        comment: EnhancedRuleComment,
        db: AsyncSession
    ) -> None:
        """Send notifications when comments are resolved."""
        try:
            if not comment.resolved_by:
                return
            notifier = NotificationService()
            users_result = await db.execute(select(User).where(User.id == comment.author_id))
            user = users_result.scalar_one_or_none()
            recipient = [user.email] if user and getattr(user, 'email', None) else []
            if not recipient:
                return
            await notifier.send_notification(
                notification_type="comment_resolved",
                message=f"Your comment {comment.comment_id} has been resolved.",
                recipients=recipient,
                priority="normal",
                metadata={"title": "Comment Resolved", "comment_id": comment.comment_id}
            )
        except Exception as e:
            logger.warning(f"Error sending comment resolution notifications: {str(e)}")

    async def _handle_review_approval(
        self,
        review: EnhancedRuleReview,
        db: AsyncSession
    ) -> None:
        """Handle actions when a review is approved."""
        try:
            # Update review completion status
            review.completed_at = datetime.utcnow()
            review.completion_reason = "approved"
            
            # Trigger post-approval workflows
            await self._trigger_post_approval_actions(review, db)
            
        except Exception as e:
            logger.warning(f"Error handling review approval: {str(e)}")

    async def _handle_review_rejection(
        self,
        review: EnhancedRuleReview,
        db: AsyncSession
    ) -> None:
        """Handle actions when a review is rejected."""
        try:
            # Update review completion status
            review.completed_at = datetime.utcnow()
            review.completion_reason = "rejected"
            
            # Trigger post-rejection workflows
            await self._trigger_post_rejection_actions(review, db)
            
        except Exception as e:
            logger.warning(f"Error handling review rejection: {str(e)}")

    async def _handle_review_completion(
        self,
        review: EnhancedRuleReview,
        db: AsyncSession
    ) -> None:
        """Handle actions when a review is completed."""
        try:
            # Update review completion status
            review.completed_at = datetime.utcnow()
            review.completion_reason = "completed"
            
            # Trigger post-completion workflows
            await self._trigger_post_completion_actions(review, db)
            
        except Exception as e:
            logger.warning(f"Error handling review completion: {str(e)}")

    async def _trigger_post_approval_actions(
        self,
        review: EnhancedRuleReview,
        db: AsyncSession
    ) -> None:
        """Trigger post-approval actions and workflows."""
        try:
            # Mark latest rule version as approved
            version_q = (
                select(RuleVersion)
                .where(RuleVersion.rule_id == review.rule_id)
                .order_by(desc(RuleVersion.created_at))
                .limit(1)
            )
            result = await db.execute(version_q)
            version = result.scalar_one_or_none()
            if version:
                version.approval_status = ApprovalStatus.APPROVED.value if hasattr(ApprovalStatus, 'APPROVED') else "approved"
                await db.flush()
        except Exception as e:
            logger.warning(f"Error triggering post-approval actions: {str(e)}")

    async def _trigger_post_rejection_actions(
        self,
        review: EnhancedRuleReview,
        db: AsyncSession
    ) -> None:
        """Trigger post-rejection actions and workflows."""
        try:
            # Escalate to requester and admins
            await self._send_review_notifications(review, "rejected", db)
        except Exception as e:
            logger.warning(f"Error triggering post-rejection actions: {str(e)}")

    async def _trigger_post_completion_actions(
        self,
        review: EnhancedRuleReview,
        db: AsyncSession
    ) -> None:
        """Trigger post-completion actions and workflows."""
        try:
            # Update analytics-like metrics
            review.review_metrics = review.review_metrics or {}
            review.review_metrics["completed_count"] = int(review.review_metrics.get("completed_count", 0)) + 1
            await db.flush()
        except Exception as e:
            logger.warning(f"Error triggering post-completion actions: {str(e)}")

    async def _identify_focus_areas(
        self,
        rule: RuleTemplate,
        review_type: ReviewType
    ) -> List[str]:
        """Identify focus areas for review based on rule and review type."""
        areas: List[str] = []
        try:
            if rule.validation_rules:
                areas.append("validation")
            if rule.compliance_requirements:
                areas.append("compliance")
            if rule.performance_metrics:
                areas.append("performance")
            # Always include logic; include security for relevant categories
            areas.append("logic")
            if str(rule.category).lower() == "security":
                areas.append("security")
            return list(dict.fromkeys(areas))  # de-duplicate preserving order
        except Exception:
            return ["logic", "performance"]

    async def _find_similar_rules(
        self,
        rule: RuleTemplate,
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Find similar rules for comparative analysis."""
        try:
            # Use cosine similarity on embeddings if available
            if rule.similarity_embeddings:
                base_vec = np.array(rule.similarity_embeddings, dtype=float)
                q = select(RuleTemplate).where(RuleTemplate.id != rule.id)
                result = await db.execute(q)
                others = result.scalars().all()
                scored = []
                for other in others:
                    if other.similarity_embeddings:
                        vec = np.array(other.similarity_embeddings, dtype=float)
                        if np.linalg.norm(base_vec) == 0 or np.linalg.norm(vec) == 0:
                            continue
                        sim = float(np.dot(base_vec, vec) / (np.linalg.norm(base_vec) * np.linalg.norm(vec)))
                        scored.append({
                            "rule_id": other.template_id,
                            "similarity_score": round(sim, 4),
                            "common_patterns": list(set((rule.keywords or [])) & set(other.keywords or []))
                        })
                scored.sort(key=lambda x: x["similarity_score"], reverse=True)
                return scored[:5]
            # Fallback to tag overlap
            q = select(RuleTemplate).where(RuleTemplate.id != rule.id)
            result = await db.execute(q)
            others = result.scalars().all()
            base_tags = set((rule.keywords or []) + (rule.tags or []))
            scored = []
            for other in others:
                tags = set((other.keywords or []) + (other.tags or []))
                overlap = len(base_tags & tags) / float(len(base_tags) or 1)
                if overlap > 0:
                    scored.append({
                        "rule_id": other.template_id,
                        "similarity_score": round(overlap, 4),
                        "common_patterns": list(base_tags & tags)
                    })
            scored.sort(key=lambda x: x["similarity_score"], reverse=True)
            return scored[:5]
        except Exception as e:
            logger.warning(f"Finding similar rules failed: {e}")
            return []

    async def _predict_potential_issues(
        self,
        rule: RuleTemplate,
        historical_reviews: List[EnhancedRuleReview]
    ) -> List[Dict[str, Any]]:
        """Predict potential issues based on historical data."""
        try:
            # Analyze historical rejection reasons and low quality scores
            issues: Dict[str, List[float]] = {"performance": [], "security": [], "compliance": [], "logic": []}
            for r in historical_reviews:
                if r.overall_decision and str(r.overall_decision).lower() == "rejected":
                    # Use risk_assessment categories if present
                    ra = r.risk_assessment or {}
                    for k in issues.keys():
                        if ra.get(k):
                            issues[k].append(float(ra.get(k)))
                if r.thoroughness_score is not None and r.thoroughness_score < 0.6:
                    issues["logic"].append(1.0 - float(r.thoroughness_score))
            predictions: List[Dict[str, Any]] = []
            for k, vals in issues.items():
                if not vals:
                    continue
                conf = max(0.5, min(0.95, float(sum(vals) / len(vals))))
                predictions.append({
                    "issue_type": k,
                    "confidence": round(conf, 3),
                    "description": f"Historical signals indicate potential {k} concerns"
                })
            # Ensure at least one signal for enterprise UX
            if not predictions:
                predictions = [{"issue_type": "logic", "confidence": 0.6, "description": "Review core logic paths for edge cases"}]
            return predictions
        except Exception as e:
            logger.warning(f"Predictive issue detection failed: {e}")
            return []

    async def _generate_quality_checklist(
        self,
        rule: RuleTemplate,
        review_type: ReviewType
    ) -> List[Dict[str, Any]]:
        """Generate quality checklist for review."""
        try:
            checklist: List[Dict[str, Any]] = []
            # Always include logic quality
            checklist.append({"category": "logic", "items": [
                "Input validation present and robust",
                "Comprehensive error handling",
                "Edge cases addressed",
                "Clear, maintainable structure"
            ]})
            # Performance
            checklist.append({"category": "performance", "items": [
                "Efficient queries / processing",
                "Resource usage within budget",
                "Scalability considerations",
                "Performance metrics defined"
            ]})
            # Compliance/Security when relevant
            cat = str(rule.category).lower() if rule.category else ""
            if cat in ("compliance", "security") or getattr(review_type, 'value', '').lower() in ("compliance", "security"):
                checklist.append({"category": "compliance", "items": [
                    "Applicable frameworks mapped",
                    "Evidence collection defined",
                    "Automated checks configured",
                    "Remediation plan ready"
                ]})
                checklist.append({"category": "security", "items": [
                    "Secure defaults and least privilege",
                    "Input sanitization",
                    "Encryption where needed",
                    "Audit trails and monitoring"
                ]})
            return checklist
        except Exception:
            return [{"category": "logic", "items": ["Input validation", "Error handling"]}]