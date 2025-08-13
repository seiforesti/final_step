from sqlmodel import Session, select, and_, or_, desc, asc
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import logging
import asyncio
from collections import defaultdict

from app.models.catalog_collaboration_models import (
    # Hub & Teams
    CatalogCollaborationHub, CollaborationTeam, TeamMember, 
    CollaborationWorkspace, CatalogWorkspaceMember as WorkspaceMember, WorkspaceAsset, WorkspaceDiscussion,
    CollaborationActivity,
    
    # Data Stewardship
    DataStewardshipCenter, DataSteward, StewardActivity, StewardshipWorkflow,
    
    # Annotations
    AnnotationManager, AnnotationTypeConfig, DataAnnotation,
    
    # Reviews
    ReviewWorkflowEngine, ReviewTypeConfig, AssetReview, Reviewer, 
    ReviewAssignment, ReviewComment,
    
    # Community & Crowdsourcing
    CrowdsourcingPlatform, CrowdsourcingCampaign, CommunityContributor,
    CommunityContribution,
    
    # Expert Networking
    ExpertNetworking, ExpertiseDomain, DomainExpert, ConsultationRequest,
    
    # Knowledge Base
    KnowledgeBase, KnowledgeCategory, KnowledgeArticle,
    
    # Community Forum
    CommunityForum, ForumCategory, ForumDiscussion, ForumMember,
    
    # Enums
    TeamType, TeamPurpose, AnnotationTargetType, AnnotationType, AnnotationStatus,
    ReviewType, ReviewStatus, ContributionType, ExpertiseLevel
)

logger = logging.getLogger(__name__)

class CatalogCollaborationService:
    """
    Advanced Catalog Collaboration Service
    
    Provides comprehensive collaboration functionality for the Advanced-Catalog
    including data stewardship, annotations, reviews, community engagement,
    expert networking, and knowledge management.
    
    Designed to exceed Databricks and Microsoft Purview capabilities with:
    - Real-time collaborative governance
    - AI-powered recommendations and insights
    - Advanced workflow orchestration
    - Community-driven data stewardship
    - Expert networking and consultation
    - Comprehensive knowledge management
    """

    # ========================================================================
    # COLLABORATION HUB MANAGEMENT
    # ========================================================================

    @staticmethod
    def create_collaboration_hub(
        session: Session,
        name: str,
        description: str,
        config: Dict[str, Any] = None,
        governance_enabled: bool = True
    ) -> Dict[str, Any]:
        """Create a new collaboration hub"""
        try:
            # Default configuration
            if config is None:
                config = {
                    "max_teams": 50,
                    "max_workspaces": 100,
                    "auto_assign_stewards": True,
                    "ai_recommendations": True,
                    "real_time_collaboration": True,
                    "activity_retention_days": 365,
                    "notification_settings": {
                        "email": True,
                        "in_app": True,
                        "slack": False
                    }
                }

            hub = CatalogCollaborationHub(
                name=name,
                description=description,
                config=config,
                governance_enabled=governance_enabled,
                auto_approval_rules={
                    "annotation_auto_approve": False,
                    "review_auto_approve": False,
                    "steward_assignment_auto": True
                },
                escalation_rules={
                    "annotation_escalation_hours": 48,
                    "review_escalation_hours": 72,
                    "steward_response_hours": 24
                },
                analytics_config={
                    "track_user_activity": True,
                    "track_asset_access": True,
                    "generate_insights": True,
                    "retention_days": 365
                }
            )

            session.add(hub)
            session.commit()
            session.refresh(hub)

            # Create default annotation manager
            annotation_manager = AnnotationManager(
                config={
                    "default_visibility": "public",
                    "require_approval": False,
                    "ai_enhancement": True,
                    "auto_tagging": True
                },
                approval_process={
                    "enabled": False,
                    "reviewers_required": 1,
                    "auto_approve_threshold": 0.8
                },
                analytics={
                    "track_views": True,
                    "track_votes": True,
                    "generate_summaries": True
                }
            )
            session.add(annotation_manager)
            session.commit()

            # Create default review workflow engine
            review_engine = ReviewWorkflowEngine(
                name=f"{name} Review Engine",
                config={
                    "auto_assignment": True,
                    "parallel_reviews": True,
                    "ai_suggestions": True,
                    "sla_tracking": True
                },
                escalation_rules=[
                    {
                        "trigger": "sla_exceeded",
                        "action": "auto_escalate",
                        "escalation_hours": 72
                    },
                    {
                        "trigger": "reviewer_unavailable",
                        "action": "reassign",
                        "backup_reviewers": True
                    }
                ]
            )
            session.add(review_engine)
            session.commit()

            return {
                "success": True,
                "hub_id": hub.id,
                "hub": {
                    "id": hub.id,
                    "name": hub.name,
                    "description": hub.description,
                    "governance_enabled": hub.governance_enabled,
                    "created_at": hub.created_at.isoformat(),
                    "annotation_manager_id": annotation_manager.id,
                    "review_engine_id": review_engine.id
                },
                "features": [
                    "team_collaboration",
                    "data_stewardship",
                    "annotation_management",
                    "review_workflows",
                    "expert_networking",
                    "knowledge_base",
                    "community_forum"
                ]
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error creating collaboration hub: {str(e)}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def create_collaboration_team(
        session: Session,
        hub_id: int,
        name: str,
        description: str,
        team_type: TeamType = TeamType.DATA_STEWARDSHIP,
        purpose: TeamPurpose = TeamPurpose.ASSET_MANAGEMENT,
        assigned_assets: List[str] = None
    ) -> Dict[str, Any]:
        """Create a new collaboration team"""
        try:
            team = CollaborationTeam(
                hub_id=hub_id,
                name=name,
                description=description,
                team_type=team_type,
                purpose=purpose,
                permissions={
                    "asset_read": True,
                    "asset_edit": False,
                    "annotation_create": True,
                    "annotation_approve": False,
                    "review_participate": True,
                    "review_approve": False
                },
                assigned_assets=assigned_assets or [],
                responsibilities=[
                    {
                        "name": "Data Quality Monitoring",
                        "description": "Monitor and ensure data quality standards",
                        "priority": "high"
                    },
                    {
                        "name": "Asset Documentation",
                        "description": "Maintain comprehensive asset documentation",
                        "priority": "medium"
                    }
                ],
                goals=[
                    {
                        "name": "Quality Score Target",
                        "target": 0.95,
                        "current": 0.0,
                        "metric": "quality_score"
                    }
                ],
                metrics={
                    "assets_managed": len(assigned_assets or []),
                    "quality_improvements": 0,
                    "annotations_created": 0,
                    "reviews_completed": 0
                }
            )

            session.add(team)
            session.commit()
            session.refresh(team)

            # Log activity
            CatalogCollaborationService._log_activity(
                session, hub_id, "team_created", "system",
                f"Team '{name}' created", "team", str(team.id)
            )

            return {
                "success": True,
                "team_id": team.id,
                "team": {
                    "id": team.id,
                    "name": team.name,
                    "description": team.description,
                    "team_type": team.team_type,
                    "purpose": team.purpose,
                    "assigned_assets": team.assigned_assets,
                    "created_at": team.created_at.isoformat()
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error creating collaboration team: {str(e)}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def add_team_member(
        session: Session,
        team_id: int,
        user_id: str,
        name: str,
        email: str,
        role: str = "member",
        expertise: List[str] = None
    ) -> Dict[str, Any]:
        """Add a member to a collaboration team"""
        try:
            # Check if member already exists
            existing = session.exec(
                select(TeamMember).where(
                    and_(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
                )
            ).first()

            if existing:
                return {"success": False, "error": "Member already exists in team"}

            member = TeamMember(
                team_id=team_id,
                user_id=user_id,
                name=name,
                email=email,
                role=role,
                permissions={
                    "read": True,
                    "write": role in ["leader", "admin"],
                    "approve": role in ["leader", "admin"],
                    "manage_members": role in ["leader", "admin"]
                },
                responsibilities=[],
                expertise=expertise or []
            )

            session.add(member)
            session.commit()
            session.refresh(member)

            # Get team info for activity logging
            team = session.get(CollaborationTeam, team_id)
            if team:
                CatalogCollaborationService._log_activity(
                    session, team.hub_id, "member_added", user_id,
                    f"Member '{name}' added to team '{team.name}'", "team", str(team_id)
                )

            return {
                "success": True,
                "member_id": member.id,
                "member": {
                    "id": member.id,
                    "user_id": member.user_id,
                    "name": member.name,
                    "email": member.email,
                    "role": member.role,
                    "expertise": member.expertise,
                    "joined_at": member.joined_at.isoformat()
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error adding team member: {str(e)}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # DATA STEWARDSHIP MANAGEMENT
    # ========================================================================

    @staticmethod
    def create_stewardship_center(
        session: Session,
        name: str,
        config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Create a data stewardship center"""
        try:
            if config is None:
                config = {
                    "auto_assign_stewards": True,
                    "steward_workload_limit": 25,
                    "quality_threshold": 0.8,
                    "escalation_enabled": True,
                    "ai_assistance": True
                }

            center = DataStewardshipCenter(
                name=name,
                config=config,
                quality_management={
                    "quality_rules_enabled": True,
                    "auto_quality_checks": True,
                    "quality_score_threshold": 0.8,
                    "quality_improvement_tracking": True
                },
                governance={
                    "compliance_checks": True,
                    "policy_enforcement": True,
                    "audit_trail": True,
                    "approval_workflows": True
                },
                metrics={
                    "track_steward_performance": True,
                    "track_asset_health": True,
                    "track_quality_improvements": True,
                    "generate_reports": True
                },
                reporting={
                    "daily_summaries": True,
                    "weekly_reports": True,
                    "monthly_analytics": True,
                    "executive_dashboards": True
                }
            )

            session.add(center)
            session.commit()
            session.refresh(center)

            return {
                "success": True,
                "center_id": center.id,
                "center": {
                    "id": center.id,
                    "name": center.name,
                    "config": center.config,
                    "created_at": center.created_at.isoformat()
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error creating stewardship center: {str(e)}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def assign_data_steward(
        session: Session,
        center_id: int,
        user_id: str,
        name: str,
        email: str,
        expertise_areas: List[str] = None,
        assigned_assets: List[str] = None
    ) -> Dict[str, Any]:
        """Assign a data steward"""
        try:
            steward = DataSteward(
                center_id=center_id,
                user_id=user_id,
                name=name,
                email=email,
                role="steward",
                responsibilities=[
                    {
                        "name": "Asset Quality Monitoring",
                        "description": "Monitor and maintain data quality standards",
                        "priority": "high"
                    },
                    {
                        "name": "Metadata Management",
                        "description": "Ensure accurate and complete metadata",
                        "priority": "medium"
                    },
                    {
                        "name": "Compliance Verification",
                        "description": "Verify compliance with governance policies",
                        "priority": "high"
                    }
                ],
                expertise_areas=expertise_areas or [],
                domains=["data_quality", "metadata", "compliance"],
                assigned_assets=assigned_assets or [],
                managed_assets=[],
                performance={
                    "quality_score": 0.0,
                    "completion_rate": 0.0,
                    "response_time_avg": 0.0,
                    "stakeholder_satisfaction": 0.0
                },
                certifications=[]
            )

            session.add(steward)
            session.commit()
            session.refresh(steward)

            # Create initial activity
            activity = StewardActivity(
                steward_id=steward.id,
                activity_type="assignment",
                description=f"Data steward '{name}' assigned to center",
                outcome="success",
                impact={
                    "assets_assigned": len(assigned_assets or []),
                    "expertise_areas": len(expertise_areas or [])
                }
            )
            session.add(activity)
            session.commit()

            return {
                "success": True,
                "steward_id": steward.id,
                "steward": {
                    "id": steward.id,
                    "user_id": steward.user_id,
                    "name": steward.name,
                    "email": steward.email,
                    "expertise_areas": steward.expertise_areas,
                    "assigned_assets": steward.assigned_assets,
                    "assigned_at": steward.assigned_at.isoformat()
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error assigning data steward: {str(e)}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # ANNOTATION MANAGEMENT
    # ========================================================================

    @staticmethod
    def create_annotation(
        session: Session,
        manager_id: int,
        target_id: str,
        target_type: AnnotationTargetType,
        content: str,
        author_id: str,
        author_name: str,
        annotation_type: AnnotationType = AnnotationType.COMMENT,
        title: str = None,
        category: str = None,
        tags: List[str] = None
    ) -> Dict[str, Any]:
        """Create a new annotation"""
        try:
            annotation = DataAnnotation(
                manager_id=manager_id,
                target_id=target_id,
                target_type=target_type,
                title=title,
                content=content,
                content_format="markdown",
                author_id=author_id,
                author_name=author_name,
                annotation_type=annotation_type,
                category=category,
                tags=tags or [],
                visibility="public",
                permissions={
                    "edit": [author_id],
                    "delete": [author_id],
                    "view": ["public"]
                },
                status=AnnotationStatus.PUBLISHED,
                approval_status="approved",
                related_annotations=[]
            )

            session.add(annotation)
            session.commit()
            session.refresh(annotation)

            return {
                "success": True,
                "annotation_id": annotation.id,
                "annotation": {
                    "id": annotation.id,
                    "target_id": annotation.target_id,
                    "target_type": annotation.target_type,
                    "title": annotation.title,
                    "content": annotation.content,
                    "author_name": annotation.author_name,
                    "annotation_type": annotation.annotation_type,
                    "category": annotation.category,
                    "tags": annotation.tags,
                    "status": annotation.status,
                    "created_at": annotation.created_at.isoformat()
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error creating annotation: {str(e)}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def get_asset_annotations(
        session: Session,
        target_id: str,
        annotation_type: AnnotationType = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get annotations for a specific asset"""
        try:
            query = select(DataAnnotation).where(DataAnnotation.target_id == target_id)
            
            if annotation_type:
                query = query.where(DataAnnotation.annotation_type == annotation_type)
            
            query = query.order_by(desc(DataAnnotation.created_at)).offset(offset).limit(limit)
            
            annotations = session.exec(query).all()

            return {
                "success": True,
                "annotations": [
                    {
                        "id": ann.id,
                        "title": ann.title,
                        "content": ann.content,
                        "author_name": ann.author_name,
                        "annotation_type": ann.annotation_type,
                        "category": ann.category,
                        "tags": ann.tags,
                        "status": ann.status,
                        "upvotes": ann.upvotes,
                        "downvotes": ann.downvotes,
                        "created_at": ann.created_at.isoformat(),
                        "updated_at": ann.updated_at.isoformat()
                    }
                    for ann in annotations
                ],
                "total": len(annotations)
            }

        except Exception as e:
            logger.error(f"Error getting asset annotations: {str(e)}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # REVIEW WORKFLOW MANAGEMENT
    # ========================================================================

    @staticmethod
    def create_asset_review(
        session: Session,
        engine_id: int,
        asset_id: str,
        review_type: ReviewType,
        requester_id: str,
        requester_name: str,
        criteria: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new asset review"""
        try:
            review = AssetReview(
                engine_id=engine_id,
                asset_id=asset_id,
                review_type=review_type,
                config={
                    "parallel_review": True,
                    "ai_assistance": True,
                    "auto_assignment": True,
                    "sla_hours": 72
                },
                requester_id=requester_id,
                requester_name=requester_name,
                review_items=[
                    {
                        "item_type": "metadata",
                        "description": "Review asset metadata completeness and accuracy"
                    },
                    {
                        "item_type": "quality",
                        "description": "Assess data quality metrics and standards"
                    },
                    {
                        "item_type": "compliance",
                        "description": "Verify compliance with governance policies"
                    }
                ],
                criteria=criteria or [
                    {
                        "name": "Metadata Completeness",
                        "description": "All required metadata fields are populated",
                        "weight": 0.3
                    },
                    {
                        "name": "Data Quality",
                        "description": "Data quality score meets minimum threshold",
                        "weight": 0.4
                    },
                    {
                        "name": "Compliance",
                        "description": "Asset complies with all applicable policies",
                        "weight": 0.3
                    }
                ],
                status=ReviewStatus.PENDING,
                progress={
                    "completed_items": 0,
                    "total_items": 3,
                    "completion_percentage": 0.0
                },
                timeline={
                    "estimated_completion": (datetime.now() + timedelta(hours=72)).isoformat(),
                    "milestones": []
                },
                due_date=datetime.now() + timedelta(hours=72),
                escalation_date=datetime.now() + timedelta(hours=96)
            )

            session.add(review)
            session.commit()
            session.refresh(review)

            # Auto-assign reviewers based on review type and asset
            CatalogCollaborationService._auto_assign_reviewers(session, review.id, review_type)

            return {
                "success": True,
                "review_id": review.id,
                "review": {
                    "id": review.id,
                    "asset_id": review.asset_id,
                    "review_type": review.review_type,
                    "requester_name": review.requester_name,
                    "status": review.status,
                    "due_date": review.due_date.isoformat() if review.due_date else None,
                    "created_at": review.created_at.isoformat()
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error creating asset review: {str(e)}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def add_review_comment(
        session: Session,
        review_id: int,
        author_id: str,
        author_name: str,
        content: str,
        comment_type: str = "general",
        parent_comment_id: int = None
    ) -> Dict[str, Any]:
        """Add a comment to a review"""
        try:
            comment = ReviewComment(
                review_id=review_id,
                author_id=author_id,
                author_name=author_name,
                content=content,
                comment_type=comment_type,
                context={
                    "timestamp": datetime.now().isoformat(),
                    "comment_thread": "main" if not parent_comment_id else "reply"
                },
                parent_comment_id=parent_comment_id
            )

            session.add(comment)
            session.commit()
            session.refresh(comment)

            return {
                "success": True,
                "comment_id": comment.id,
                "comment": {
                    "id": comment.id,
                    "author_name": comment.author_name,
                    "content": comment.content,
                    "comment_type": comment.comment_type,
                    "parent_comment_id": comment.parent_comment_id,
                    "created_at": comment.created_at.isoformat()
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error adding review comment: {str(e)}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # COMMUNITY & CROWDSOURCING
    # ========================================================================

    @staticmethod
    def create_crowdsourcing_campaign(
        session: Session,
        platform_id: int,
        name: str,
        description: str,
        campaign_type: str = "annotation",
        target_assets: List[str] = None,
        goals: Dict[str, Any] = None,
        end_date: datetime = None
    ) -> Dict[str, Any]:
        """Create a crowdsourcing campaign"""
        try:
            campaign = CrowdsourcingCampaign(
                platform_id=platform_id,
                name=name,
                description=description,
                campaign_type=campaign_type,
                goals=goals or {
                    "total_contributions": 100,
                    "quality_threshold": 0.8,
                    "participation_rate": 0.6
                },
                target_assets=target_assets or [],
                asset_criteria={
                    "min_quality_score": 0.0,
                    "missing_metadata": True,
                    "asset_types": ["dataset", "table", "view"]
                },
                incentives={
                    "points_per_contribution": 10,
                    "bonus_thresholds": [25, 50, 100],
                    "recognition_levels": ["bronze", "silver", "gold"]
                },
                progress={
                    "contributions_received": 0,
                    "participants": 0,
                    "completion_percentage": 0.0
                },
                end_date=end_date or (datetime.now() + timedelta(days=30))
            )

            session.add(campaign)
            session.commit()
            session.refresh(campaign)

            return {
                "success": True,
                "campaign_id": campaign.id,
                "campaign": {
                    "id": campaign.id,
                    "name": campaign.name,
                    "description": campaign.description,
                    "campaign_type": campaign.campaign_type,
                    "target_assets": campaign.target_assets,
                    "goals": campaign.goals,
                    "start_date": campaign.start_date.isoformat(),
                    "end_date": campaign.end_date.isoformat() if campaign.end_date else None,
                    "status": campaign.status
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error creating crowdsourcing campaign: {str(e)}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def submit_community_contribution(
        session: Session,
        platform_id: int,
        contributor_id: int,
        contribution_type: ContributionType,
        title: str,
        target_asset_id: str,
        content: Dict[str, Any],
        description: str = None
    ) -> Dict[str, Any]:
        """Submit a community contribution"""
        try:
            contribution = CommunityContribution(
                platform_id=platform_id,
                contributor_id=contributor_id,
                contribution_type=contribution_type,
                title=title,
                description=description,
                content=content,
                target_asset_id=target_asset_id,
                target_context={
                    "asset_type": content.get("asset_type", "unknown"),
                    "domain": content.get("domain", "general")
                },
                quality_score=0.0,
                validation_status="pending",
                impact_score=0.0,
                status="submitted"
            )

            session.add(contribution)
            session.commit()
            session.refresh(contribution)

            # Update contributor stats
            contributor = session.get(CommunityContributor, contributor_id)
            if contributor:
                contributor.contribution_count += 1
                contributor.last_contribution = datetime.now()
                session.add(contributor)
                session.commit()

            return {
                "success": True,
                "contribution_id": contribution.id,
                "contribution": {
                    "id": contribution.id,
                    "title": contribution.title,
                    "contribution_type": contribution.contribution_type,
                    "target_asset_id": contribution.target_asset_id,
                    "status": contribution.status,
                    "submitted_at": contribution.submitted_at.isoformat()
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error submitting community contribution: {str(e)}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # EXPERT NETWORKING
    # ========================================================================

    @staticmethod
    def request_expert_consultation(
        session: Session,
        network_id: int,
        requester_id: str,
        topic: str,
        description: str,
        urgency: str = "medium",
        related_assets: List[str] = None
    ) -> Dict[str, Any]:
        """Request expert consultation"""
        try:
            # Find suitable expert based on topic and expertise
            expert = CatalogCollaborationService._find_suitable_expert(session, network_id, topic)
            
            request = ConsultationRequest(
                network_id=network_id,
                requester_id=requester_id,
                expert_id=expert.id if expert else None,
                topic=topic,
                description=description,
                urgency=urgency,
                context={
                    "domain": CatalogCollaborationService._extract_domain_from_topic(topic),
                    "complexity": "medium",
                    "estimated_duration": "30_minutes"
                },
                related_assets=related_assets or [],
                status="matched" if expert else "requested"
            )

            if expert:
                request.matched_at = datetime.now()

            session.add(request)
            session.commit()
            session.refresh(request)

            return {
                "success": True,
                "request_id": request.id,
                "consultation": {
                    "id": request.id,
                    "topic": request.topic,
                    "description": request.description,
                    "urgency": request.urgency,
                    "status": request.status,
                    "expert_matched": expert.name if expert else None,
                    "requested_at": request.requested_at.isoformat(),
                    "matched_at": request.matched_at.isoformat() if request.matched_at else None
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error requesting expert consultation: {str(e)}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # KNOWLEDGE BASE MANAGEMENT
    # ========================================================================

    @staticmethod
    def create_knowledge_article(
        session: Session,
        knowledge_base_id: int,
        title: str,
        content: str,
        summary: str = None,
        keywords: List[str] = None,
        tags: List[str] = None,
        authors: List[Dict[str, Any]] = None,
        related_assets: List[str] = None
    ) -> Dict[str, Any]:
        """Create a knowledge base article"""
        try:
            article = KnowledgeArticle(
                knowledge_base_id=knowledge_base_id,
                title=title,
                content=content,
                summary=summary,
                keywords=keywords or [],
                tags=tags or [],
                authors=authors or [],
                contributors=[],
                related_assets=related_assets or [],
                related_articles=[],
                status="published",
                version="1.0",
                quality_score=0.8,  # Initial score
                approval_status="approved"
            )

            session.add(article)
            session.commit()
            session.refresh(article)

            return {
                "success": True,
                "article_id": article.id,
                "article": {
                    "id": article.id,
                    "title": article.title,
                    "summary": article.summary,
                    "keywords": article.keywords,
                    "tags": article.tags,
                    "authors": article.authors,
                    "status": article.status,
                    "quality_score": article.quality_score,
                    "created_at": article.created_at.isoformat(),
                    "published_at": article.published_at.isoformat() if article.published_at else None
                }
            }

        except Exception as e:
            session.rollback()
            logger.error(f"Error creating knowledge article: {str(e)}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # ANALYTICS & INSIGHTS
    # ========================================================================

    @staticmethod
    def get_collaboration_analytics(
        session: Session,
        hub_id: int,
        time_period: str = "week",
        metrics: List[str] = None
    ) -> Dict[str, Any]:
        """Get collaboration analytics and insights"""
        try:
            end_date = datetime.now()
            
            if time_period == "day":
                start_date = end_date - timedelta(days=1)
            elif time_period == "week":
                start_date = end_date - timedelta(days=7)
            elif time_period == "month":
                start_date = end_date - timedelta(days=30)
            else:
                start_date = end_date - timedelta(days=7)

            # Get activities
            activities = session.exec(
                select(CollaborationActivity).where(
                    and_(
                        CollaborationActivity.hub_id == hub_id,
                        CollaborationActivity.timestamp >= start_date
                    )
                )
            ).all()

            # Get teams
            teams = session.exec(
                select(CollaborationTeam).where(CollaborationTeam.hub_id == hub_id)
            ).all()

            # Get annotations
            annotations = session.exec(
                select(DataAnnotation).where(
                    DataAnnotation.created_at >= start_date
                )
            ).all()

            # Get reviews
            reviews = session.exec(
                select(AssetReview).where(
                    AssetReview.created_at >= start_date
                )
            ).all()

            analytics = {
                "time_period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                    "period": time_period
                },
                "activity_summary": {
                    "total_activities": len(activities),
                    "unique_users": len(set(act.user_id for act in activities)),
                    "activity_types": CatalogCollaborationService._count_by_field(activities, "activity_type")
                },
                "team_metrics": {
                    "total_teams": len(teams),
                    "total_members": sum(len(team.members) for team in teams),
                    "team_types": CatalogCollaborationService._count_by_field(teams, "team_type"),
                    "active_teams": len([team for team in teams if team.status == "active"])
                },
                "annotation_metrics": {
                    "total_annotations": len(annotations),
                    "annotation_types": CatalogCollaborationService._count_by_field(annotations, "annotation_type"),
                    "avg_upvotes": sum(ann.upvotes for ann in annotations) / len(annotations) if annotations else 0
                },
                "review_metrics": {
                    "total_reviews": len(reviews),
                    "review_types": CatalogCollaborationService._count_by_field(reviews, "review_type"),
                    "review_statuses": CatalogCollaborationService._count_by_field(reviews, "status"),
                    "avg_completion_time": CatalogCollaborationService._calculate_avg_review_time(reviews)
                },
                "collaboration_insights": {
                    "most_active_users": CatalogCollaborationService._get_most_active_users(activities),
                    "trending_topics": CatalogCollaborationService._get_trending_topics(annotations),
                    "quality_trends": CatalogCollaborationService._analyze_quality_trends(annotations, reviews)
                }
            }

            return {
                "success": True,
                "analytics": analytics,
                "generated_at": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error getting collaboration analytics: {str(e)}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    @staticmethod
    def _log_activity(
        session: Session,
        hub_id: int,
        activity_type: str,
        user_id: str,
        description: str,
        entity_type: str = None,
        entity_id: str = None,
        metadata: Dict[str, Any] = None
    ):
        """Log collaboration activity"""
        try:
            activity = CollaborationActivity(
                hub_id=hub_id,
                activity_type=activity_type,
                user_id=user_id,
                description=description,
                entity_type=entity_type,
                entity_id=entity_id,
                metadata=metadata or {}
            )
            session.add(activity)
            session.commit()
        except Exception as e:
            logger.warning(f"Error logging activity: {str(e)}")

    @staticmethod
    def _auto_assign_reviewers(session: Session, review_id: int, review_type: ReviewType):
        """Auto-assign reviewers based on review type and availability"""
        try:
            # Get available reviewers for this review type
            reviewers = session.exec(
                select(Reviewer).where(
                    and_(
                        Reviewer.status == "active",
                        Reviewer.review_types.contains([review_type.value])
                    )
                )
            ).all()

            # Assign the first available reviewer (simplified logic)
            if reviewers:
                reviewer = reviewers[0]
                assignment = ReviewAssignment(
                    review_id=review_id,
                    reviewer_id=reviewer.id,
                    role="reviewer",
                    assignment_type="automatic",
                    due_date=datetime.now() + timedelta(hours=48)
                )
                session.add(assignment)
                session.commit()

        except Exception as e:
            logger.warning(f"Error auto-assigning reviewers: {str(e)}")

    @staticmethod
    def _find_suitable_expert(session: Session, network_id: int, topic: str) -> Optional[DomainExpert]:
        """Find suitable expert based on topic"""
        try:
            # Simple keyword matching (in production, use AI/ML for better matching)
            experts = session.exec(
                select(DomainExpert).where(
                    and_(
                        DomainExpert.network_id == network_id,
                        DomainExpert.status == "active"
                    )
                )
            ).all()

            # Return first available expert (simplified logic)
            return experts[0] if experts else None

        except Exception as e:
            logger.warning(f"Error finding suitable expert: {str(e)}")
            return None

    @staticmethod
    def _extract_domain_from_topic(topic: str) -> str:
        """Extract domain from consultation topic"""
        topic_lower = topic.lower()
        if "quality" in topic_lower:
            return "data_quality"
        elif "compliance" in topic_lower:
            return "compliance"
        elif "metadata" in topic_lower:
            return "metadata"
        else:
            return "general"

    @staticmethod
    def _count_by_field(items: List, field: str) -> Dict[str, int]:
        """Count items by field value"""
        counts = defaultdict(int)
        for item in items:
            value = getattr(item, field, "unknown")
            counts[str(value)] += 1
        return dict(counts)

    @staticmethod
    def _calculate_avg_review_time(reviews: List[AssetReview]) -> float:
        """Calculate average review completion time in hours"""
        completed_reviews = [r for r in reviews if r.completed_at and r.created_at]
        if not completed_reviews:
            return 0.0
        
        total_hours = sum(
            (r.completed_at - r.created_at).total_seconds() / 3600
            for r in completed_reviews
        )
        return total_hours / len(completed_reviews)

    @staticmethod
    def _get_most_active_users(activities: List[CollaborationActivity]) -> List[Dict[str, Any]]:
        """Get most active users based on activity count"""
        user_counts = defaultdict(int)
        for activity in activities:
            user_counts[activity.user_id] += 1
        
        # Return top 5 most active users
        return [
            {"user_id": user_id, "activity_count": count}
            for user_id, count in sorted(user_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

    @staticmethod
    def _get_trending_topics(annotations: List[DataAnnotation]) -> List[str]:
        """Get trending topics from annotation tags"""
        tag_counts = defaultdict(int)
        for annotation in annotations:
            for tag in annotation.tags:
                tag_counts[tag] += 1
        
        # Return top 5 trending tags
        return [
            tag for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

    @staticmethod
    def _analyze_quality_trends(annotations: List[DataAnnotation], reviews: List[AssetReview]) -> Dict[str, Any]:
        """Analyze quality trends from annotations and reviews"""
        quality_annotations = [ann for ann in annotations if ann.annotation_type == AnnotationType.QUALITY_NOTE]
        quality_reviews = [rev for rev in reviews if rev.review_type == ReviewType.QUALITY_REVIEW]
        
        return {
            "quality_annotations_count": len(quality_annotations),
            "quality_reviews_count": len(quality_reviews),
            "avg_annotation_upvotes": sum(ann.upvotes for ann in quality_annotations) / len(quality_annotations) if quality_annotations else 0,
            "quality_review_completion_rate": len([r for r in quality_reviews if r.status == ReviewStatus.APPROVED]) / len(quality_reviews) if quality_reviews else 0
        }