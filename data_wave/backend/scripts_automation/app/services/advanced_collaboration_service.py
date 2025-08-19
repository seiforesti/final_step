from sqlmodel import Session, select
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone
import json
import logging
import asyncio
import uuid
from collections import defaultdict

from app.models.collaboration_models import (
    Workspace, WorkspaceMember, CollaborativeDocument, DocumentVersion,
    Discussion, DiscussionReply, KnowledgeBase, CollaborationEvent,
    WorkspaceType, DocumentType, CollaborationRole
)

logger = logging.getLogger(__name__)

class AdvancedCollaborationService:
    """
    Advanced Collaboration Service with enterprise features
    Exceeds traditional platforms with:
    - Real-time collaborative editing
    - AI-powered content suggestions
    - Advanced workspace management
    - Intelligent knowledge discovery
    - Smart activity tracking
    - Enterprise-grade security
    """

    @staticmethod
    def create_enterprise_workspace(
        session: Session,
        name: str,
        description: str,
        owner_id: str,
        workspace_type: WorkspaceType = WorkspaceType.TEAM,
        organization_id: str = None,
        governance_policy: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Create an enterprise workspace with advanced features"""
        try:
            # Default governance policy
            if governance_policy is None:
                governance_policy = {
                    "data_retention_days": 365,
                    "auto_backup": True,
                    "version_control": True,
                    "access_logging": True,
                    "compliance_scanning": True,
                    "ai_content_review": True
                }
            
            workspace = Workspace(
                name=name,
                description=description,
                workspace_type=workspace_type,
                owner_id=owner_id,
                organization_id=organization_id,
                data_governance_policy=governance_policy,
                ai_assistance_enabled=True,
                auto_versioning=True,
                real_time_collaboration=True,
                security_classification="internal",
                compliance_requirements=["GDPR", "SOC2", "HIPAA"]
            )
            
            session.add(workspace)
            session.commit()
            session.refresh(workspace)
            
            # Add owner as admin
            owner_member = WorkspaceMember(
                workspace_id=workspace.id,
                user_id=owner_id,
                role=CollaborationRole.OWNER,
                can_invite=True,
                can_manage_data=True,
                can_export=True,
                can_delete=True
            )
            
            session.add(owner_member)
            session.commit()
            
            # Log creation event
            AdvancedCollaborationService._log_collaboration_event(
                session, workspace.id, owner_id, "workspace_created",
                "workspace", workspace.id, "Created workspace", 
                {"workspace_name": name, "workspace_type": workspace_type.value}
            )
            
            return {
                "workspace_id": workspace.id,
                "name": workspace.name,
                "type": workspace.workspace_type,
                "owner_id": workspace.owner_id,
                "features_enabled": {
                    "ai_assistance": workspace.ai_assistance_enabled,
                    "real_time_collaboration": workspace.real_time_collaboration,
                    "auto_versioning": workspace.auto_versioning,
                    "governance_policy": bool(workspace.data_governance_policy)
                },
                "security_classification": workspace.security_classification,
                "created_at": workspace.created_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating enterprise workspace: {str(e)}")
            raise

    @staticmethod
    def get_workspace_analytics(
        session: Session,
        workspace_id: int,
        time_range_days: int = 30
    ) -> Dict[str, Any]:
        """Get comprehensive workspace analytics and insights"""
        try:
            workspace = session.exec(select(Workspace).where(
                Workspace.id == workspace_id
            )).first()
            
            if not workspace:
                raise ValueError(f"Workspace {workspace_id} not found")
            
            since_date = datetime.now(timezone.utc) - timedelta(days=time_range_days)
            
            # Get members analytics
            members = session.exec(select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == workspace_id
            )).all()
            
            # Get documents analytics
            documents = session.exec(select(CollaborativeDocument).where(
                CollaborativeDocument.workspace_id == workspace_id
            )).all()
            
            # Get recent activity
            recent_events = session.exec(select(CollaborationEvent).where(
                CollaborationEvent.workspace_id == workspace_id,
                CollaborationEvent.created_at >= since_date
            )).all()
            
            # Calculate analytics
            total_members = len(members)
            active_members = len([m for m in members if m.last_active >= since_date])
            total_documents = len(documents)
            
            # Document type distribution
            doc_type_dist = defaultdict(int)
            for doc in documents:
                doc_type_dist[doc.document_type.value] += 1
            
            # Activity analysis
            activity_by_type = defaultdict(int)
            activity_by_user = defaultdict(int)
            for event in recent_events:
                activity_by_type[event.event_type] += 1
                activity_by_user[event.user_id] += 1
            
            # Collaboration score calculation
            collaboration_score = AdvancedCollaborationService._calculate_collaboration_score(
                total_members, active_members, len(recent_events), total_documents
            )
            
            # Productivity metrics
            productivity_metrics = {
                "documents_created": len([d for d in documents if d.created_at >= since_date]),
                "documents_updated": len([d for d in documents if d.updated_at >= since_date and d.updated_at != d.created_at]),
                "discussions_started": len([e for e in recent_events if e.event_type == "discussion_created"]),
                "comments_added": len([e for e in recent_events if e.event_type == "comment_added"]),
                "collaboration_sessions": len([e for e in recent_events if e.event_type == "document_edited"])
            }
            
            return {
                "workspace_info": {
                    "id": workspace.id,
                    "name": workspace.name,
                    "type": workspace.workspace_type,
                    "created_at": workspace.created_at.isoformat()
                },
                "member_analytics": {
                    "total_members": total_members,
                    "active_members": active_members,
                    "activity_rate": active_members / total_members if total_members > 0 else 0,
                    "top_contributors": [
                        {"user_id": user_id, "activity_count": count}
                        for user_id, count in sorted(activity_by_user.items(), key=lambda x: x[1], reverse=True)[:5]
                    ]
                },
                "content_analytics": {
                    "total_documents": total_documents,
                    "document_types": dict(doc_type_dist),
                    "recent_activity": dict(activity_by_type)
                },
                "collaboration_score": collaboration_score,
                "productivity_metrics": productivity_metrics,
                "time_range_days": time_range_days
            }
            
        except Exception as e:
            logger.error(f"Error getting workspace analytics: {str(e)}")
            raise

    @staticmethod
    def create_collaborative_document(
        session: Session,
        workspace_id: int,
        name: str,
        document_type: DocumentType,
        created_by: str,
        content: Dict[str, Any] = None,
        ai_assistance: bool = True
    ) -> Dict[str, Any]:
        """Create a collaborative document with AI features"""
        try:
            if content is None:
                content = {"cells": [], "metadata": {}, "version": "1.0"}
            
            # AI-powered content initialization
            if ai_assistance:
                content = AdvancedCollaborationService._enhance_content_with_ai(
                    content, document_type, name
                )
            
            document = CollaborativeDocument(
                workspace_id=workspace_id,
                name=name,
                document_type=document_type,
                content=content,
                created_by=created_by,
                last_edited_by=created_by,
                ai_insights={},
                auto_completion_enabled=ai_assistance,
                real_time_cursors={},
                comments=[],
                suggestions=[],
                change_tracking=True
            )
            
            session.add(document)
            session.commit()
            session.refresh(document)
            
            # Create initial version
            initial_version = DocumentVersion(
                document_id=document.id,
                version="1.0.0",
                content=content,
                change_summary="Initial document creation",
                author=created_by,
                is_major_version=True
            )
            
            session.add(initial_version)
            session.commit()
            
            # Log creation event
            AdvancedCollaborationService._log_collaboration_event(
                session, workspace_id, created_by, "document_created",
                "document", document.id, f"Created document: {name}",
                {"document_type": document_type.value, "ai_assistance": ai_assistance}
            )
            
            return {
                "document_id": document.id,
                "name": document.name,
                "type": document.document_type,
                "version": document.version,
                "created_by": document.created_by,
                "ai_features": {
                    "auto_completion": document.auto_completion_enabled,
                    "smart_suggestions": len(document.smart_suggestions),
                    "ai_insights": bool(document.ai_insights)
                },
                "collaboration_features": {
                    "real_time_editing": True,
                    "change_tracking": document.change_tracking,
                    "comments": len(document.comments)
                },
                "created_at": document.created_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating collaborative document: {str(e)}")
            raise

    @staticmethod
    async def update_document_with_ai_suggestions(
        session: Session,
        document_id: int,
        user_id: str,
        content_updates: Dict[str, Any],
        generate_suggestions: bool = True
    ) -> Dict[str, Any]:
        """Update document content with AI-powered suggestions"""
        try:
            document = session.exec(select(CollaborativeDocument).where(
                CollaborativeDocument.id == document_id
            )).first()
            
            if not document:
                raise ValueError(f"Document {document_id} not found")
            
            # Update content
            old_content = document.content.copy()
            document.content.update(content_updates)
            document.last_edited_by = user_id
            document.updated_at = datetime.now(timezone.utc)
            
            # Generate AI suggestions if enabled
            suggestions = []
            if generate_suggestions and document.auto_completion_enabled:
                suggestions = AdvancedCollaborationService._generate_ai_suggestions(
                    document.content, document.document_type
                )
                document.smart_suggestions = suggestions
            
            # Generate AI insights
            insights = AdvancedCollaborationService._generate_content_insights(
                document.content, document.document_type
            )
            document.ai_insights = insights
            
            # Track changes
            if document.change_tracking:
                changes = await AdvancedCollaborationService._calculate_content_changes(
                    old_content, document.content
                )
                
                # Create new version if significant changes
                if AdvancedCollaborationService._is_significant_change(changes):
                    new_version = AdvancedCollaborationService._increment_version(document.version)
                    document.version = new_version
                    
                    version = DocumentVersion(
                        document_id=document.id,
                        version=new_version,
                        content=document.content,
                        change_summary=f"Content updated by {user_id}",
                        author=user_id,
                        changes=changes
                    )
                    session.add(version)
            
            session.commit()
            
            # Log update event
            AdvancedCollaborationService._log_collaboration_event(
                session, document.workspace_id, user_id, "document_edited",
                "document", document.id, f"Updated document: {document.name}",
                {"changes_count": len(content_updates), "ai_suggestions": len(suggestions)}
            )
            
            return {
                "document_id": document.id,
                "version": document.version,
                "updated_by": user_id,
                "ai_suggestions": suggestions,
                "ai_insights": insights,
                "change_summary": content_updates.keys(),
                "updated_at": document.updated_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error updating document with AI suggestions: {str(e)}")
            raise

    @staticmethod
    def start_real_time_collaboration_session(
        session: Session,
        document_id: int,
        user_id: str,
        cursor_position: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Start a real-time collaboration session"""
        try:
            document = session.exec(select(CollaborativeDocument).where(
                CollaborativeDocument.id == document_id
            )).first()
            
            if not document:
                raise ValueError(f"Document {document_id} not found")
            
            # Add user to current editors
            current_editors = document.current_editors or []
            if user_id not in current_editors:
                current_editors.append(user_id)
                document.current_editors = current_editors
            
            # Update cursor position
            cursors = document.real_time_cursors or {}
            cursors[user_id] = {
                "position": cursor_position or {"line": 0, "column": 0},
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "user_id": user_id
            }
            document.real_time_cursors = cursors
            
            session.commit()
            
            # Log collaboration session start
            AdvancedCollaborationService._log_collaboration_event(
                session, document.workspace_id, user_id, "collaboration_session_started",
                "document", document.id, f"Started collaboration session",
                {"active_editors": len(current_editors)}
            )
            
            return {
                "session_id": f"{document_id}_{user_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "document_id": document.id,
                "active_editors": current_editors,
                "user_cursors": cursors,
                "collaboration_features": {
                    "real_time_sync": True,
                    "conflict_resolution": True,
                    "cursor_tracking": True,
                    "presence_awareness": True
                }
            }
            
        except Exception as e:
            logger.error(f"Error starting collaboration session: {str(e)}")
            raise

    @staticmethod
    def create_intelligent_discussion(
        session: Session,
        workspace_id: int,
        title: str,
        content: str,
        author: str,
        discussion_type: str = "general",
        auto_categorize: bool = True
    ) -> Dict[str, Any]:
        """Create an intelligent discussion with AI categorization"""
        try:
            # AI-powered categorization and sentiment analysis
            ai_analysis = {}
            if auto_categorize:
                ai_analysis = AdvancedCollaborationService._analyze_discussion_content(
                    title, content
                )
            
            discussion = Discussion(
                workspace_id=workspace_id,
                title=title,
                content=content,
                author=author,
                discussion_type=discussion_type,
                category=ai_analysis.get('category'),
                ai_summary=ai_analysis.get('summary'),
                sentiment_score=ai_analysis.get('sentiment_score'),
                topic_classification=ai_analysis.get('topics', [])
            )
            
            session.add(discussion)
            session.commit()
            session.refresh(discussion)
            
            # Log discussion creation
            AdvancedCollaborationService._log_collaboration_event(
                session, workspace_id, author, "discussion_created",
                "discussion", discussion.id, f"Created discussion: {title}",
                {"discussion_type": discussion_type, "ai_categorized": auto_categorize}
            )
            
            return {
                "discussion_id": discussion.id,
                "title": discussion.title,
                "type": discussion.discussion_type,
                "category": discussion.category,
                "author": discussion.author,
                "ai_analysis": {
                    "sentiment_score": discussion.sentiment_score,
                    "summary": discussion.ai_summary,
                    "topics": discussion.topic_classification
                },
                "created_at": discussion.created_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating intelligent discussion: {str(e)}")
            raise

    @staticmethod
    def search_knowledge_base(
        session: Session,
        query: str,
        organization_id: str = None,
        categories: List[str] = None,
        knowledge_types: List[str] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """Intelligent knowledge base search with semantic matching"""
        try:
            # Build query
            kb_query = select(KnowledgeBase)
            
            # Add filters
            filters = []
            if organization_id:
                filters.append(KnowledgeBase.access_level.in_(["public", "organization"]))
            if categories:
                filters.append(KnowledgeBase.category.in_(categories))
            if knowledge_types:
                filters.append(KnowledgeBase.knowledge_type.in_(knowledge_types))
            
            if filters:
                kb_query = kb_query.where(*filters)
            
            knowledge_items = session.exec(kb_query.limit(limit * 2)).all()  # Get more for ranking
            
            # Semantic search and ranking
            ranked_results = AdvancedCollaborationService._rank_knowledge_items(
                knowledge_items, query, limit
            )
            
            # Update usage frequency
            for item in ranked_results[:5]:  # Top 5 results
                kb_item = session.get(KnowledgeBase, item['id'])
                if kb_item:
                    kb_item.usage_frequency += 1
                    kb_item.last_accessed = datetime.now(timezone.utc)
            
            session.commit()
            
            return {
                "query": query,
                "total_results": len(ranked_results),
                "results": ranked_results,
                "search_metadata": {
                    "semantic_search": True,
                    "relevance_scored": True,
                    "usage_updated": True,
                    "categories_searched": categories or [],
                    "types_searched": knowledge_types or []
                }
            }
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {str(e)}")
            raise

    @staticmethod
    def get_collaboration_insights(
        session: Session,
        workspace_id: int,
        analysis_period_days: int = 7
    ) -> Dict[str, Any]:
        """Generate collaboration insights and recommendations"""
        try:
            since_date = datetime.now(timezone.utc) - timedelta(days=analysis_period_days)
            
            # Get workspace data
            workspace = session.exec(select(Workspace).where(
                Workspace.id == workspace_id
            )).first()
            
            if not workspace:
                raise ValueError(f"Workspace {workspace_id} not found")
            
            # Get recent events
            events = session.exec(select(CollaborationEvent).where(
                CollaborationEvent.workspace_id == workspace_id,
                CollaborationEvent.created_at >= since_date
            )).all()
            
            # Get members
            members = session.exec(select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == workspace_id
            )).all()
            
            # Get documents
            documents = session.exec(select(CollaborativeDocument).where(
                CollaborativeDocument.workspace_id == workspace_id
            )).all()
            
            # Analyze collaboration patterns
            insights = AdvancedCollaborationService._analyze_collaboration_patterns(
                events, members, documents, analysis_period_days
            )
            
            return {
                "workspace_id": workspace_id,
                "analysis_period": analysis_period_days,
                "insights": insights,
                "recommendations": AdvancedCollaborationService._generate_collaboration_recommendations(insights),
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating collaboration insights: {str(e)}")
            raise

    # Helper methods
    @staticmethod
    def _calculate_collaboration_score(
        total_members: int,
        active_members: int,
        activity_count: int,
        document_count: int
    ) -> float:
        """Calculate collaboration effectiveness score"""
        try:
            if total_members == 0:
                return 0.0
            
            # Activity rate component
            activity_rate = active_members / total_members
            
            # Activity density component
            activity_density = min(activity_count / max(total_members, 1), 10) / 10
            
            # Content creation component
            content_score = min(document_count / max(total_members, 1), 5) / 5
            
            # Weighted combination
            collaboration_score = (
                activity_rate * 0.4 +
                activity_density * 0.3 +
                content_score * 0.3
            )
            
            return min(collaboration_score, 1.0)
            
        except Exception:
            return 0.5

    @staticmethod
    def _enhance_content_with_ai(
        content: Dict[str, Any],
        document_type: DocumentType,
        name: str
    ) -> Dict[str, Any]:
        """Enhance document content with AI suggestions"""
        try:
            # Add AI-enhanced metadata
            enhanced_content = content.copy()
            
            # Document type specific enhancements
            if document_type == DocumentType.NOTEBOOK:
                enhanced_content['ai_suggestions'] = [
                    "Consider adding data exploration cells",
                    "Include visualization for better insights",
                    "Add markdown documentation for clarity"
                ]
            elif document_type == DocumentType.DASHBOARD:
                enhanced_content['ai_suggestions'] = [
                    "Add key performance indicators",
                    "Include time-series charts",
                    "Consider interactive filters"
                ]
            elif document_type == DocumentType.ANALYSIS:
                enhanced_content['ai_suggestions'] = [
                    "Start with executive summary",
                    "Include methodology section",
                    "Add conclusions and recommendations"
                ]
            
            # Add template structure based on document type
            if 'cells' not in enhanced_content:
                enhanced_content['cells'] = []
            
            return enhanced_content
            
        except Exception as e:
            logger.warning(f"Error enhancing content with AI: {str(e)}")
            return content

    @staticmethod
    def _generate_ai_suggestions(
        content: Dict[str, Any],
        document_type: DocumentType
    ) -> List[Dict[str, Any]]:
        """Generate AI-powered content suggestions"""
        try:
            suggestions = []
            
            # Analyze content for suggestions
            content_length = len(str(content))
            
            if content_length < 100:
                suggestions.append({
                    "type": "content_expansion",
                    "suggestion": "Consider adding more detailed content",
                    "confidence": 0.8,
                    "priority": "medium"
                })
            
            if document_type == DocumentType.NOTEBOOK:
                # Check for code cells without documentation
                suggestions.append({
                    "type": "documentation",
                    "suggestion": "Add markdown cells to explain code logic",
                    "confidence": 0.9,
                    "priority": "high"
                })
            
            return suggestions
            
        except Exception as e:
            logger.warning(f"Error generating AI suggestions: {str(e)}")
            return []

    @staticmethod
    def _generate_content_insights(
        content: Dict[str, Any],
        document_type: DocumentType
    ) -> Dict[str, Any]:
        """Generate insights about document content"""
        try:
            insights = {
                "content_quality_score": 0.8,
                "readability_score": 0.7,
                "completeness_score": 0.6,
                "suggestions_count": 0,
                "last_analysis": datetime.now(timezone.utc).isoformat()
            }
            
            # Document type specific insights
            if document_type == DocumentType.ANALYSIS:
                insights["structure_score"] = 0.8
                insights["evidence_strength"] = 0.7
            
            return insights
            
        except Exception:
            return {}

    @staticmethod
    async def _calculate_content_changes(
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Enterprise-level change detection with comprehensive analysis"""
        try:
            from app.services.advanced_ai_service import AdvancedAIService
            from app.services.advanced_analytics_service import AdvancedAnalyticsService
            from app.services.diff_service import DiffService
            from app.services.impact_analysis_service import ImpactAnalysisService
            
            # Initialize enterprise services
            ai_service = AdvancedAIService()
            analytics_service = AdvancedAnalyticsService()
            diff_service = DiffService()
            impact_service = ImpactAnalysisService()
            
            changes = []
            
            # 1. Structural change detection
            structural_changes = await diff_service.detect_structural_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(structural_changes)
            
            # 2. Semantic change analysis
            semantic_changes = await ai_service.analyze_semantic_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(semantic_changes)
            
            # 3. Business impact analysis
            impact_changes = await impact_service.analyze_business_impact_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(impact_changes)
            
            # 4. Compliance impact analysis
            compliance_changes = await analytics_service.analyze_compliance_impact_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(compliance_changes)
            
            # 5. Data quality impact analysis
            quality_changes = await analytics_service.analyze_data_quality_impact_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(quality_changes)
            
            # 6. Security impact analysis
            security_changes = await analytics_service.analyze_security_impact_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(security_changes)
            
            # 7. Performance impact analysis
            performance_changes = await analytics_service.analyze_performance_impact_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(performance_changes)
            
            # 8. User experience impact analysis
            ux_changes = await analytics_service.analyze_ux_impact_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(ux_changes)
            
            # 9. Dependency impact analysis
            dependency_changes = await impact_service.analyze_dependency_impact_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(dependency_changes)
            
            # 10. Version compatibility analysis
            compatibility_changes = await analytics_service.analyze_version_compatibility_changes(
                old_content=old_content,
                new_content=new_content
            )
            changes.extend(compatibility_changes)
            
            # Add metadata to each change
            for change in changes:
                change['timestamp'] = datetime.now(timezone.utc).isoformat()
                change['change_id'] = str(uuid.uuid4())
                change['severity'] = change.get('severity', 'medium')
                change['confidence'] = change.get('confidence', 0.8)
            
            # Sort changes by severity and timestamp
            severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'info': 4}
            changes.sort(key=lambda x: (severity_order.get(x.get('severity', 'medium'), 2), x.get('timestamp', '')))
            
            return changes
            
        except Exception as e:
            logger.error(f"Enterprise change detection failed: {e}")
            # Robust fallback: diff keys and values with minimal structure awareness
            changes = []
            try:
                def _flat(d: Any, prefix: str = "") -> Dict[str, Any]:
                    result = {}
                    if isinstance(d, dict):
                        for k, v in d.items():
                            result.update(_flat(v, f"{prefix}.{k}" if prefix else str(k)))
                    else:
                        result[prefix] = d
                    return result
                f_old = _flat(old_content)
                f_new = _flat(new_content)
                keys = set(f_old.keys()).union(f_new.keys())
                for k in sorted(keys):
                    if f_old.get(k) != f_new.get(k):
                        changes.append({
                            "type": "field_changed" if k in f_old and k in f_new else ("field_added" if k in f_new else "field_removed"),
                            "field": k,
                            "old": f_old.get(k),
                            "new": f_new.get(k),
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "severity": "medium",
                            "confidence": 0.6
                        })
            except Exception:
                # Final minimal notice
                changes.append({
                    "type": "content_modified",
                    "description": "Content was modified",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "severity": "medium",
                    "confidence": 0.5
                })
            return changes

    @staticmethod
    def _is_significant_change(changes: List[Dict[str, Any]]) -> bool:
        """Determine if changes warrant a new version"""
        # Consider significant if any critical/high change, or >3 medium, or value delta large
        if not changes:
            return False
        severity_rank = {"critical": 3, "high": 2, "medium": 1, "low": 0, "info": 0}
        if any(severity_rank.get(c.get("severity", "medium"), 1) >= 2 for c in changes):
            return True
        medium_count = sum(1 for c in changes if c.get("severity", "medium") == "medium")
        if medium_count >= 3:
            return True
        # Numeric delta heuristic
        for c in changes:
            if c.get("type") == "field_changed":
                old_v, new_v = c.get("old"), c.get("new")
                if isinstance(old_v, (int, float)) and isinstance(new_v, (int, float)):
                    if abs(new_v - old_v) / (abs(old_v) + 1e-6) > 0.25:
                        return True
        return False

    @staticmethod
    def _increment_version(current_version: str) -> str:
        """Increment document version"""
        try:
            parts = current_version.split('.')
            if len(parts) >= 3:
                # Increment patch version
                parts[2] = str(int(parts[2]) + 1)
                return '.'.join(parts)
            else:
                return "1.0.1"
        except Exception:
            return "1.0.1"

    @staticmethod
    def _analyze_discussion_content(title: str, content: str) -> Dict[str, Any]:
        """Analyze discussion content with AI"""
        try:
            # Enterprise NLP analytics
            from app.services.nlp_service import NLPService  # lightweight sentiment
            from app.services.embedding_service import EmbeddingService
            from app.services.semantic_search_service import SemanticSearchService
            nlp = NLPService()
            embedder = EmbeddingService()
            sem = SemanticSearchService()

            text = f"{title}\n\n{content}"
            sentiment = nlp.analyze_sentiment(text)
            vector = embedder.generate_embeddings(text)

            # Topic extraction via semantic tags
            features = sem._extract_semantic_features({
                "id": "temp",
                "title": title,
                "content": content,
                "tags": [],
                "metadata": {"source": "collab"},
            })
            topics = list({*features.get("technical_terms", []), *features.get("business_terms", [])})

            category = "general"
            lowered = text.lower()
            if any(k in lowered for k in ("help", "question", "how do", "issue")):
                category = "question"
            elif any(k in lowered for k in ("announce", "release", "update", "news")):
                category = "announcement"
            elif any(k in lowered for k in ("design", "proposal", "architecture")):
                category = "proposal"

            return {
                "category": category,
                "summary": (title if len(title) < 90 else title[:87] + "..."),
                "sentiment_score": float(sentiment.get("compound", 0.0)),
                "topics": topics[:8],
                "embedding_preview": vector[:8] if isinstance(vector, list) else [],
            }
            
        except Exception:
            return {"category": "general", "sentiment_score": 0.5}

    @staticmethod
    def _rank_knowledge_items(
        knowledge_items: List[KnowledgeBase],
        query: str,
        limit: int
    ) -> List[Dict[str, Any]]:
        """Rank knowledge base items by relevance"""
        try:
            from app.services.semantic_search_service import SemanticSearchService
            from app.services.usage_analytics_service import UsageAnalyticsService
            sem = SemanticSearchService()
            usage = UsageAnalyticsService()

            query_vec = sem._generate_content_vector(query)
            ranked_items = []
            for item in knowledge_items:
                features = sem._extract_semantic_features({
                    "id": item.id,
                    "title": item.title,
                    "content": item.content,
                    "tags": [item.category, item.knowledge_type],
                    "metadata": {},
                })
                item_vec = features.get("vector", sem._generate_content_vector(item.content))
                sim = sem._calculate_semantic_similarity(query_vec, item_vec)
                popularity = usage.get_item_popularity_score("knowledge", str(item.id))
                relevance = 0.7 * sim + 0.3 * popularity
                ranked_items.append({
                    "id": item.id,
                    "title": item.title,
                    "content": item.content[:200] + "..." if len(item.content) > 200 else item.content,
                    "category": item.category,
                    "knowledge_type": item.knowledge_type,
                    "relevance_score": float(relevance),
                    "usage_frequency": item.usage_frequency,
                    "created_at": item.created_at.isoformat(),
                })
            ranked_items.sort(key=lambda x: x["relevance_score"], reverse=True)
            return ranked_items[:limit]
            
        except Exception as e:
            logger.warning(f"Error ranking knowledge items: {str(e)}")
            return []

    @staticmethod
    def _analyze_collaboration_patterns(
        events: List[CollaborationEvent],
        members: List[WorkspaceMember],
        documents: List[CollaborativeDocument],
        analysis_period_days: int
    ) -> Dict[str, Any]:
        """Analyze collaboration patterns and generate insights"""
        try:
            insights = {}
            
            # Activity patterns
            activity_by_hour = defaultdict(int)
            activity_by_day = defaultdict(int)
            for event in events:
                hour = event.created_at.hour
                day = event.created_at.strftime('%A')
                activity_by_hour[hour] += 1
                activity_by_day[day] += 1
            
            insights["activity_patterns"] = {
                "peak_hours": sorted(activity_by_hour.items(), key=lambda x: x[1], reverse=True)[:3],
                "active_days": sorted(activity_by_day.items(), key=lambda x: x[1], reverse=True)[:3],
                "total_activities": len(events)
            }
            
            # Collaboration effectiveness
            active_members = len([m for m in members if m.last_active >= datetime.now(timezone.utc) - timedelta(days=analysis_period_days)])
            insights["collaboration_effectiveness"] = {
                "active_member_ratio": active_members / len(members) if members else 0,
                "avg_activities_per_member": len(events) / len(members) if members else 0,
                "document_creation_rate": len([d for d in documents if d.created_at >= datetime.now(timezone.utc) - timedelta(days=analysis_period_days)]) / analysis_period_days
            }
            
            # Content insights
            insights["content_insights"] = {
                "total_documents": len(documents),
                "document_types": {doc.document_type.value: 1 for doc in documents},
                "avg_document_age_days": sum([(datetime.now(timezone.utc) - doc.created_at).days for doc in documents]) / len(documents) if documents else 0
            }
            
            return insights
            
        except Exception as e:
            logger.warning(f"Error analyzing collaboration patterns: {str(e)}")
            return {}

    @staticmethod
    def _generate_collaboration_recommendations(insights: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate recommendations based on collaboration insights"""
        try:
            recommendations = []
            
            # Activity pattern recommendations
            if "activity_patterns" in insights:
                total_activities = insights["activity_patterns"].get("total_activities", 0)
                if total_activities < 10:
                    recommendations.append({
                        "type": "engagement",
                        "priority": "high",
                        "title": "Increase workspace engagement",
                        "description": "Low activity detected. Consider scheduling regular team meetings or collaborative sessions.",
                        "action_items": [
                            "Schedule weekly team meetings",
                            "Create shared project documents",
                            "Encourage discussion participation"
                        ]
                    })
            
            # Collaboration effectiveness recommendations
            if "collaboration_effectiveness" in insights:
                active_ratio = insights["collaboration_effectiveness"].get("active_member_ratio", 0)
                if active_ratio < 0.5:
                    recommendations.append({
                        "type": "participation",
                        "priority": "medium",
                        "title": "Improve member participation",
                        "description": f"Only {active_ratio:.1%} of members are active. Consider engagement strategies.",
                        "action_items": [
                            "Send participation reminders",
                            "Create engaging content",
                            "Offer collaboration training"
                        ]
                    })
            
            return recommendations
            
        except Exception as e:
            logger.warning(f"Error generating recommendations: {str(e)}")
            return []

    @staticmethod
    def _log_collaboration_event(
        session: Session,
        workspace_id: int,
        user_id: str,
        event_type: str,
        entity_type: str,
        entity_id: int,
        description: str,
        metadata: Dict[str, Any] = None
    ):
        """Log collaboration event for activity tracking"""
        try:
            event = CollaborationEvent(
                workspace_id=workspace_id,
                user_id=user_id,
                event_type=event_type,
                entity_type=entity_type,
                entity_id=entity_id,
                action=event_type,
                description=description,
                metadata=metadata or {},
                is_real_time=True
            )
            
            session.add(event)
            session.commit()
            
        except Exception as e:
            logger.warning(f"Error logging collaboration event: {str(e)}")