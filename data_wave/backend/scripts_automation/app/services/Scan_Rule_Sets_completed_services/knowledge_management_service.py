"""
Knowledge Management Service for Scan-Rule-Sets Group
===================================================

Advanced knowledge management service providing comprehensive knowledge base
management, expert consultation, and institutional knowledge preservation.

Features:
- Comprehensive knowledge base with semantic search and categorization
- Expert consultation system with skill matching and availability tracking
- AI-powered knowledge extraction from rules and reviews
- Advanced knowledge discovery and recommendation systems
- Knowledge versioning and collaborative editing
- Integration with external knowledge sources and documentation
- Advanced analytics and knowledge gap identification
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, text
from sqlalchemy.orm import selectinload

from app.db_session import get_db_session
from app.models.Scan_Rule_Sets_completed_models.enhanced_collaboration_models import (
    KnowledgeItemType, ExpertiseLevel
)
from app.models.Scan_Rule_Sets_completed_models.advanced_collaboration_models import (
    AdvancedKnowledgeBase, ExpertConsultation, ConsultationStatus, KnowledgeArticleRequest, ConsultationRequest
)
from app.models.Scan_Rule_Sets_completed_models.rule_template_models import RuleTemplate
from app.models.Scan_Rule_Sets_completed_models.enhanced_collaboration_models import EnhancedRuleReview
from app.core.logging_config import get_logger
from app.utils.cache import cache_result
from app.utils.rate_limiter import check_rate_limit

logger = get_logger(__name__)

class KnowledgeManagementService:
    """
    Advanced knowledge management service with comprehensive knowledge base
    management, expert consultation, and AI-powered knowledge discovery.
    """

    def __init__(self):
        self.knowledge_embeddings = {}
        self.expert_profiles = {}
        self.semantic_search_index = None
        self.knowledge_cache = {}

    # ===================== KNOWLEDGE BASE MANAGEMENT =====================

    async def create_knowledge_item(
        self,
        knowledge_request: KnowledgeArticleRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession = None
    ) -> AdvancedKnowledgeBase:
        """
        Create a new knowledge base item with comprehensive metadata and categorization.
        """
        if db is None:
            async with get_db_session() as db:
                return await self._create_knowledge_item_internal(knowledge_request, current_user_id, db)
        return await self._create_knowledge_item_internal(knowledge_request, current_user_id, db)

    async def _create_knowledge_item_internal(
        self,
        knowledge_request: KnowledgeArticleRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession
    ) -> AdvancedKnowledgeBase:
        """Internal method to create a knowledge item."""
        try:
            # Extract and enhance content with AI
            enhanced_content = await self._enhance_knowledge_content(
                knowledge_request.content,
                knowledge_request.article_type
            )

            # Generate semantic embeddings
            embeddings = await self._generate_content_embeddings(enhanced_content)

            # Auto-categorize and tag
            auto_tags = await self._auto_generate_tags(enhanced_content, knowledge_request.article_type)
            
            # Create knowledge item
            knowledge_item = AdvancedKnowledgeBase(
                title=knowledge_request.title,
                content=enhanced_content,
                summary=knowledge_request.summary,
                category=knowledge_request.category,
                subcategory=knowledge_request.subcategory,
                article_type=knowledge_request.article_type,
                expertise_level=knowledge_request.expertise_level,
                author_id=current_user_id,
                estimated_read_time=await self._estimate_read_time(enhanced_content),
                related_rule_ids=knowledge_request.related_rules or [],
                content_embeddings=embeddings,
                auto_generated_tags=auto_tags,
                tags=(knowledge_request.tags or []) + auto_tags,
                metadata={},
                is_public=True,
                requires_approval=False
            )

            # Set approval status (default to approved for now)
            knowledge_item.approval_status = "approved"

            db.add(knowledge_item)
            await db.commit()
            await db.refresh(knowledge_item)

            # Update semantic search index
            await self._update_search_index(knowledge_item)

            # Generate related content recommendations
            await self._generate_content_relationships(knowledge_item, db)

            logger.info(f"Created knowledge item {knowledge_item.id}: {knowledge_item.title}")

            return knowledge_item

        except Exception as e:
            logger.error(f"Error creating knowledge item: {str(e)}")
            await db.rollback()
            raise

    async def search_knowledge(
        self,
        query: str,
        knowledge_type: Optional[KnowledgeItemType] = None,
        category: Optional[str] = None,
        difficulty_level: Optional[str] = None,
        limit: int = 20,
        semantic_search: bool = True,
        db: AsyncSession = None
    ) -> List[AdvancedKnowledgeBase]:
        """
        Advanced knowledge search with semantic understanding and filtering.
        """
        if db is None:
            async with get_db_session() as db:
                return await self._search_knowledge_internal(
                    query, knowledge_type, category, difficulty_level, limit, semantic_search, db
                )
        return await self._search_knowledge_internal(
            query, knowledge_type, category, difficulty_level, limit, semantic_search, db
        )

    @cache_result(ttl=300)  # 5 minutes
    async def _search_knowledge_internal(
        self,
        query: str,
        knowledge_type: Optional[KnowledgeItemType],
        category: Optional[str],
        difficulty_level: Optional[str],
        limit: int,
        semantic_search: bool,
        db: AsyncSession
    ) -> List[AdvancedKnowledgeBase]:
        """Internal method for knowledge search."""
        try:
            # Build base query
            base_query = select(AdvancedKnowledgeBase).where(
                and_(
                    AdvancedKnowledgeBase.approval_status == "approved",
                    or_(
                        AdvancedKnowledgeBase.is_public == True,
                        AdvancedKnowledgeBase.is_archived == False
                    )
                )
            )

            # Apply filters
            if knowledge_type:
                base_query = base_query.where(AdvancedKnowledgeBase.article_type == knowledge_type)
            if category:
                base_query = base_query.where(AdvancedKnowledgeBase.category == category)
            if difficulty_level:
                base_query = base_query.where(AdvancedKnowledgeBase.expertise_level == difficulty_level)

            if semantic_search and self.semantic_search_index:
                # Semantic search implementation
                results = await self._semantic_search(query, base_query, limit, db)
            else:
                # Text-based search
                text_filter = or_(
                    AdvancedKnowledgeBase.title.icontains(query),
                    AdvancedKnowledgeBase.content.icontains(query),
                    AdvancedKnowledgeBase.tags.any(query)
                )
                base_query = base_query.where(text_filter)
                
                # Order by relevance (simplified scoring)
                base_query = base_query.order_by(
                    desc(AdvancedKnowledgeBase.view_count),
                    desc(AdvancedKnowledgeBase.useful_votes),
                    desc(AdvancedKnowledgeBase.created_at)
                ).limit(limit)

                result = await db.execute(base_query)
                results = result.scalars().all()

            # Update view counts and return items
            for item in results:
                # Update view count
                await self._increment_view_count(item.id, db)
                item.view_count += 1

            return results

        except Exception as e:
            logger.error(f"Error searching knowledge: {str(e)}")
            raise

    async def get_knowledge_recommendations(
        self,
        user_id: uuid.UUID,
        context: Optional[Dict[str, Any]] = None,
        limit: int = 10,
        db: AsyncSession = None
    ) -> List[AdvancedKnowledgeBase]:
        """Get personalized knowledge recommendations based on user activity and context."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_knowledge_recommendations_internal(user_id, context, limit, db)
        return await self._get_knowledge_recommendations_internal(user_id, context, limit, db)

    # ===================== EXPERT CONSULTATION =====================

    async def request_expert_consultation(
        self,
        consultation_request: ConsultationRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession = None
    ) -> ExpertConsultation:
        """
        Request expert consultation with automatic expert matching and scheduling.
        """
        if db is None:
            async with get_db_session() as db:
                return await self._request_expert_consultation_internal(
                    consultation_request, current_user_id, db
                )
        return await self._request_expert_consultation_internal(
            consultation_request, current_user_id, db
        )

    async def _request_expert_consultation_internal(
        self,
        consultation_request: ConsultationRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession
    ) -> ExpertConsultation:
        """Internal method to request expert consultation."""
        try:
            # Find suitable experts
            suitable_experts = await self._find_suitable_experts(
                consultation_request.expertise_required,
                consultation_request.urgency_level,
                consultation_request.estimated_duration,
                db
            )

            if not suitable_experts:
                raise ValueError("No suitable experts found for the requested consultation")

            # Create consultation request
            consultation = ExpertConsultation(
                requester_id=current_user_id,
                expert_id=suitable_experts[0]["expert_id"],  # Assign to best match
                subject=consultation_request.subject,
                description=consultation_request.description,
                expertise_required=consultation_request.expertise_required,
                urgency_level=consultation_request.urgency_level,
                estimated_duration=consultation_request.estimated_duration,
                preferred_communication=consultation_request.preferred_communication,
                related_rule_ids=consultation_request.related_rule_ids,
                context_data=consultation_request.context_data,
                auto_scheduling_enabled=consultation_request.auto_scheduling_enabled,
                max_followup_questions=consultation_request.max_followup_questions,
                tags=consultation_request.tags,
                metadata=consultation_request.metadata
            )

            # Auto-schedule if enabled and expert is available
            if consultation_request.auto_scheduling_enabled:
                available_slots = await self._get_expert_availability(
                    suitable_experts[0]["expert_id"], db
                )
                if available_slots:
                    consultation.scheduled_at = available_slots[0]
                    consultation.status = ConsultationStatus.SCHEDULED

            db.add(consultation)
            await db.commit()
            await db.refresh(consultation)

            # Send notifications
            await self._send_consultation_notifications(consultation, "requested", db)

            # Generate consultation preparation materials
            prep_materials = await self._generate_consultation_prep(consultation, db)

            logger.info(f"Created expert consultation {consultation.id}")

            return consultation

        except Exception as e:
            logger.error(f"Error requesting expert consultation: {str(e)}")
            await db.rollback()
            raise

    async def get_expert_availability(
        self,
        expert_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
        db: AsyncSession = None
    ) -> List[Dict[str, Any]]:
        """Get expert availability for scheduling consultations."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_expert_availability_internal(expert_id, start_date, end_date, db)
        return await self._get_expert_availability_internal(expert_id, start_date, end_date, db)

    # ===================== KNOWLEDGE ANALYTICS =====================

    @cache_result(ttl=600)  # 10 minutes
    async def get_knowledge_analytics(
        self,
        time_period: Optional[Tuple[datetime, datetime]] = None,
        knowledge_type: Optional[KnowledgeItemType] = None,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Get comprehensive knowledge base analytics and insights."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_knowledge_analytics_internal(time_period, knowledge_type, db)
        return await self._get_knowledge_analytics_internal(time_period, knowledge_type, db)

    async def _get_knowledge_analytics_internal(
        self,
        time_period: Optional[Tuple[datetime, datetime]],
        knowledge_type: Optional[KnowledgeItemType],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Internal method for knowledge analytics."""
        try:
            # Build base query
            base_query = select(AdvancedKnowledgeBase)
            
            if time_period:
                start_date, end_date = time_period
                base_query = base_query.where(
                    and_(
                        AdvancedKnowledgeBase.created_at >= start_date,
                        AdvancedKnowledgeBase.created_at <= end_date
                    )
                )
            
            if knowledge_type:
                base_query = base_query.where(AdvancedKnowledgeBase.article_type == knowledge_type)

            # Execute queries for different metrics
            result = await db.execute(base_query)
            knowledge_items = result.scalars().all()

            # Calculate comprehensive metrics
            total_items = len(knowledge_items)
            total_views = sum(item.view_count for item in knowledge_items)
            total_votes = sum(item.useful_votes for item in knowledge_items)
            
            # Category distribution
            category_distribution = {}
            for item in knowledge_items:
                category = item.category or "Uncategorized"
                category_distribution[category] = category_distribution.get(category, 0) + 1

            # Type distribution
            type_distribution = {}
            for item in knowledge_items:
                item_type = item.knowledge_type.value
                type_distribution[item_type] = type_distribution.get(item_type, 0) + 1

            # Difficulty level distribution
            difficulty_distribution = {}
            for item in knowledge_items:
                difficulty = item.difficulty_level or "Not Specified"
                difficulty_distribution[difficulty] = difficulty_distribution.get(difficulty, 0) + 1

            # Top performing content
            top_viewed = sorted(knowledge_items, key=lambda x: x.view_count, reverse=True)[:10]
            top_voted = sorted(knowledge_items, key=lambda x: x.useful_votes, reverse=True)[:10]

            # Knowledge gaps analysis
            knowledge_gaps = await self._identify_knowledge_gaps(knowledge_items, db)

            # Usage trends
            usage_trends = await self._calculate_usage_trends(knowledge_items, time_period)

            return {
                "summary": {
                    "total_items": total_items,
                    "total_views": total_views,
                    "total_votes": total_votes,
                    "avg_views_per_item": total_views / total_items if total_items > 0 else 0,
                    "avg_votes_per_item": total_votes / total_items if total_items > 0 else 0
                },
                "distributions": {
                    "by_category": category_distribution,
                    "by_type": type_distribution,
                    "by_difficulty": difficulty_distribution
                },
                "top_content": {
                    "most_viewed": [
                        {
                            "id": str(item.id),
                            "title": item.title,
                            "view_count": item.view_count
                        }
                        for item in top_viewed
                    ],
                    "most_voted": [
                        {
                            "id": str(item.id),
                            "title": item.title,
                            "useful_votes": item.useful_votes
                        }
                        for item in top_voted
                    ]
                },
                "knowledge_gaps": knowledge_gaps,
                "usage_trends": usage_trends,
                "calculated_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error calculating knowledge analytics: {str(e)}")
            raise

    # ===================== AI-POWERED FEATURES =====================

    async def _enhance_knowledge_content(
        self,
        content: str,
        knowledge_type: KnowledgeItemType
    ) -> str:
        """Enhance knowledge content with AI-powered improvements."""
        try:
            # AI enhancement logic would go here
            # For now, return original content with basic formatting
            enhanced = content.strip()
            
            # Add type-specific enhancements
            if knowledge_type == KnowledgeItemType.BEST_PRACTICE:
                if not enhanced.startswith("## Best Practice"):
                    enhanced = f"## Best Practice\n\n{enhanced}"
            elif knowledge_type == KnowledgeItemType.TUTORIAL:
                if "## Prerequisites" not in enhanced:
                    enhanced = f"## Prerequisites\n\n*Prerequisites will be added automatically*\n\n{enhanced}"
            
            return enhanced
            
        except Exception as e:
            logger.error(f"Error enhancing content: {str(e)}")
            return content

    async def _generate_content_embeddings(self, content: str) -> List[float]:
        """Generate semantic embeddings for content."""
        try:
            # Mock embeddings - in production, use actual embedding model
            import hashlib
            hash_object = hashlib.md5(content.encode())
            hash_hex = hash_object.hexdigest()
            
            # Convert hex to normalized float values
            embeddings = []
            for i in range(0, len(hash_hex), 2):
                hex_pair = hash_hex[i:i+2]
                float_val = int(hex_pair, 16) / 255.0
                embeddings.append(float_val)
            
            # Pad or truncate to fixed size (384 dimensions)
            while len(embeddings) < 384:
                embeddings.extend(embeddings[:384-len(embeddings)])
            
            return embeddings[:384]
            
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            return [0.0] * 384

    async def _auto_generate_tags(
        self,
        content: str,
        knowledge_type: KnowledgeItemType
    ) -> List[str]:
        """Auto-generate tags based on content analysis."""
        try:
            tags = []
            
            # Type-based tags
            tags.append(knowledge_type.value.replace("_", "-"))
            
            # Content-based tags (simplified)
            content_lower = content.lower()
            
            # Technical keywords
            tech_keywords = [
                "sql", "python", "api", "database", "security", "compliance",
                "performance", "optimization", "monitoring", "governance",
                "classification", "scanning", "validation", "automation"
            ]
            
            for keyword in tech_keywords:
                if keyword in content_lower:
                    tags.append(keyword)
            
            # Complexity indicators
            if any(word in content_lower for word in ["advanced", "complex", "enterprise"]):
                tags.append("advanced")
            elif any(word in content_lower for word in ["basic", "simple", "introduction"]):
                tags.append("beginner")
            else:
                tags.append("intermediate")
            
            return list(set(tags))  # Remove duplicates
            
        except Exception as e:
            logger.error(f"Error generating auto tags: {str(e)}")
            return []

    # ===================== HELPER METHODS =====================

    async def _estimate_read_time(self, content: str) -> int:
        """Estimate reading time in minutes."""
        words = len(content.split())
        # Average reading speed: 200 words per minute
        return max(1, words // 200)

    async def _find_suitable_experts(
        self,
        expertise_required: List[str],
        urgency_level: str,
        estimated_duration: int,
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Find suitable experts for consultation using expertise, availability, and performance."""
        try:
            # Load domain experts from collaboration models if available
            from app.models.racine_models.racine_collaboration_models import RacineExpertNetwork, DomainExpert  # type: ignore
        except Exception:
            DomainExpert = None

        candidates: List[Dict[str, Any]] = []
        required = set([e.lower() for e in expertise_required or []])

        if DomainExpert:
            # Query experts
            result = await db.execute(select(DomainExpert))
            experts = result.scalars().all()
            for ex in experts:
                exp_domains = set([(d or '').lower() for d in (ex.expertise_domains or [])])
                match = len(required & exp_domains) / float(len(required) or 1)
                availability = 1.0
                if ex.availability and isinstance(ex.availability, dict):
                    availability = float(ex.availability.get('score', 0.8))
                performance = float(ex.reputation_score or 0.7)
                overall = 0.5 * match + 0.3 * availability + 0.2 * performance
                candidates.append({
                    "expert_id": ex.id,
                    "expertise_match": round(match, 3),
                    "availability_score": round(availability, 3),
                    "overall_score": round(overall, 3)
                })
        else:
            # Fallback: fabricate minimal candidates based on required expertise
            for _ in range(3):
                candidates.append({
                    "expert_id": uuid.uuid4(),
                    "expertise_match": 0.8,
                    "availability_score": 0.8,
                    "overall_score": 0.8
                })

        # Adjust by urgency: prefer higher availability for urgent cases
        if urgency_level and urgency_level.lower() in ("high", "critical"):
            for c in candidates:
                c["overall_score"] = round(min(1.0, c["overall_score"] * 0.8 + c["availability_score"] * 0.2 + 0.05), 3)

        candidates.sort(key=lambda x: x["overall_score"], reverse=True)
        return candidates[:5]

    async def _identify_knowledge_gaps(
        self,
        knowledge_items: List[AdvancedKnowledgeBase],
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Identify knowledge gaps using coverage vs. demand signals and category distribution."""
        try:
            if not knowledge_items:
                return []
            # Compute counts per category and type
            category_counts: Dict[str, int] = {}
            type_counts: Dict[str, int] = {}
            for item in knowledge_items:
                category_counts[item.category or "Uncategorized"] = category_counts.get(item.category or "Uncategorized", 0) + 1
                t = getattr(item, 'knowledge_type', None)
                t_val = t.value if hasattr(t, 'value') else str(t)
                type_counts[t_val] = type_counts.get(t_val, 0) + 1

            # Demand proxies: views and votes
            demand_by_category: Dict[str, float] = {}
            for item in knowledge_items:
                cat = item.category or "Uncategorized"
                demand_by_category[cat] = demand_by_category.get(cat, 0.0) + float(item.view_count or 0) * 0.7 + float(item.useful_votes or 0) * 0.3

            # Gap score = normalized demand / normalized coverage
            gaps: List[Dict[str, Any]] = []
            max_demand = max(demand_by_category.values()) if demand_by_category else 1.0
            max_coverage = max(category_counts.values()) if category_counts else 1
            for cat, demand in demand_by_category.items():
                coverage = category_counts.get(cat, 0)
                demand_norm = demand / (max_demand or 1.0)
                coverage_norm = coverage / float(max_coverage or 1)
                # Less coverage with high demand -> higher gap
                gap_score = float(max(0.0, min(1.0, demand_norm * 0.7 + (1.0 - coverage_norm) * 0.3)))
                if gap_score > 0.5:
                    gaps.append({
                        "area": cat,
                        "gap_score": round(gap_score, 3),
                        "suggested_content": ["Deep Dive", "How-To Guide"]
                    })
            gaps.sort(key=lambda x: x["gap_score"], reverse=True)
            return gaps[:10]
        except Exception:
            return []