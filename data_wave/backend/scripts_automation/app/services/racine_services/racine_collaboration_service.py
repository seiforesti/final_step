"""
Racine Collaboration Service - Master Collaboration System
=========================================================

This service provides comprehensive collaboration features for the entire data governance platform,
including real-time communication, document management, workflow collaboration, and expert networks.

Features:
- Real-time multi-user collaboration and co-authoring
- Cross-group workflow collaboration and task management
- Expert consultation networks and knowledge sharing
- Document collaboration with version control
- Team communication centers with chat, comments, and notifications
- External collaborator integration with granular access controls
- Collaboration analytics and engagement metrics
- Integration with all 7 groups for unified collaboration experience
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple, Set
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from dataclasses import dataclass
from enum import Enum
import websockets
from concurrent.futures import ThreadPoolExecutor

# Import all required models for full integration
from ...models.racine_models.racine_collaboration_models import (
    RacineCollaborationSession, RacineCollaborationParticipant, RacineCollaborationMessage,
    RacineCollaborationDocument, RacineCollaborationWorkflow, RacineCollaborationComment,
    RacineCollaborationNotification, RacineCollaborationSpace, RacineExpertNetwork,
    RacineKnowledgeBase, RacineCollaborationAnalytics, RacineExternalCollaborator
)
from ...models.racine_models.racine_workspace_models import RacineWorkspace, RacineWorkspaceMember
from ...models.auth_models import User, Role
from ...models.scan_models import Scan, ScanResult
from ...models.compliance_models import ComplianceRule, ComplianceValidation
from ...models.classification_models import ClassificationRule
from ...models.advanced_catalog_models import CatalogItem
from ...models.workflow_models import Workflow

# Import existing services for integration
from ..advanced_collaboration_service import AdvancedCollaborationService
from ..notification_service import NotificationService
from ..ai_service import AdvancedAIService
from ..data_source_service import DataSourceService
from ..scan_service import ScanService
from ..compliance_rule_service import ComplianceRuleService
from ..classification_service import EnterpriseClassificationService
from ..enterprise_catalog_service import EnterpriseIntelligentCatalogService

class CollaborationType(Enum):
    REAL_TIME_EDITING = "real_time_editing"
    WORKFLOW_COLLABORATION = "workflow_collaboration"
    DOCUMENT_COLLABORATION = "document_collaboration"
    EXPERT_CONSULTATION = "expert_consultation"
    TEAM_COMMUNICATION = "team_communication"
    KNOWLEDGE_SHARING = "knowledge_sharing"

class CollaborationScope(Enum):
    SYSTEM_WIDE = "system_wide"
    WORKSPACE = "workspace"
    GROUP_SPECIFIC = "group_specific"
    PROJECT = "project"
    PRIVATE = "private"

class ParticipantRole(Enum):
    OWNER = "owner"
    EDITOR = "editor"
    REVIEWER = "reviewer"
    VIEWER = "viewer"
    EXPERT = "expert"
    GUEST = "guest"

class MessageType(Enum):
    TEXT = "text"
    SYSTEM = "system"
    FILE = "file"
    WORKFLOW_UPDATE = "workflow_update"
    MENTION = "mention"
    REACTION = "reaction"

@dataclass
class CollaborationConfiguration:
    """Configuration for collaboration session"""
    name: str
    description: str
    collaboration_type: CollaborationType
    scope: CollaborationScope
    participants: List[Dict[str, Any]]
    settings: Dict[str, Any]
    access_control: Dict[str, Any] = None
    workspace_id: Optional[str] = None
    group_context: Optional[str] = None

@dataclass
class RealTimeEditingConfig:
    """Configuration for real-time editing sessions"""
    document_id: str
    lock_mode: str = "optimistic"  # optimistic, pessimistic, collaborative
    auto_save_interval: int = 5  # seconds
    conflict_resolution: str = "merge"  # merge, latest_wins, manual
    version_tracking: bool = True

@dataclass
class ExpertConsultationRequest:
    """Request for expert consultation"""
    topic: str
    description: str
    expertise_required: List[str]
    urgency: str = "normal"  # low, normal, high, critical
    context_groups: List[str] = None
    attachments: List[str] = None

class RacineCollaborationService:
    """
    Racine Collaboration Service providing comprehensive collaboration management
    with real-time features and cross-group integration
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        
        # Initialize all existing services for full integration
        self.advanced_collaboration = AdvancedCollaborationService(db_session)
        self.notification_service = NotificationService(db_session)
        self.ai_service = AdvancedAIService(db_session)
        self.data_source_service = DataSourceService(db_session)
        self.scan_service = ScanService(db_session)
        self.compliance_service = ComplianceRuleService(db_session)
        self.classification_service = EnterpriseClassificationService(db_session)
        self.catalog_service = EnterpriseIntelligentCatalogService(db_session)
        
        # Service registry for dynamic access to all groups
        self.service_registry = {
            'data_sources': self.data_source_service,
            'scans': self.scan_service,
            'compliance': self.compliance_service,
            'classifications': self.classification_service,
            'catalog': self.catalog_service
        }
        
        # Real-time connection management
        self._active_sessions = {}  # session_id -> websocket connections
        self._session_participants = {}  # session_id -> set of user_ids
        self._document_locks = {}  # document_id -> user_id
        
        # Expert network cache
        self._expert_cache = {}
        self._expertise_mapping = {}
        
        # Thread pool for background tasks
        self._executor = ThreadPoolExecutor(max_workers=10)
        
    async def create_collaboration_session(
        self, 
        config: CollaborationConfiguration, 
        creator_id: str
    ) -> RacineCollaborationSession:
        """
        Create a new collaboration session with specified configuration
        
        Args:
            config: Collaboration session configuration
            creator_id: User creating the session
            
        Returns:
            Created collaboration session
        """
        try:
            # Create collaboration session
            session = RacineCollaborationSession(
                id=str(uuid.uuid4()),
                name=config.name,
                description=config.description,
                collaboration_type=config.collaboration_type.value,
                scope=config.scope.value,
                workspace_id=config.workspace_id,
                group_context=config.group_context,
                session_configuration=config.settings,
                access_control_config=config.access_control or {},
                status='active',
                created_by=creator_id
            )
            
            self.db.add(session)
            self.db.flush()
            
            # Add participants
            for participant_config in config.participants:
                participant = await self._add_session_participant(
                    session.id, 
                    participant_config, 
                    creator_id
                )
            
            # Create collaboration space
            space = RacineCollaborationSpace(
                id=str(uuid.uuid4()),
                session_id=session.id,
                space_type=config.collaboration_type.value,
                configuration={
                    'real_time_enabled': True,
                    'notification_enabled': True,
                    'history_retention': '30d'
                },
                created_by=creator_id,
                status='active'
            )
            
            self.db.add(space)
            
            # Initialize session-specific features
            if config.collaboration_type == CollaborationType.REAL_TIME_EDITING:
                await self._initialize_real_time_editing(session.id, config.settings)
            elif config.collaboration_type == CollaborationType.EXPERT_CONSULTATION:
                await self._initialize_expert_consultation(session.id, config.settings)
            elif config.collaboration_type == CollaborationType.WORKFLOW_COLLABORATION:
                await self._initialize_workflow_collaboration(session.id, config.settings)
            
            # Set up analytics tracking
            await self._initialize_collaboration_analytics(session.id)
            
            self.db.commit()
            
            return session
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create collaboration session: {str(e)}")
    
    async def _add_session_participant(
        self, 
        session_id: str, 
        participant_config: Dict[str, Any], 
        added_by: str
    ) -> RacineCollaborationParticipant:
        """Add participant to collaboration session"""
        
        participant = RacineCollaborationParticipant(
            id=str(uuid.uuid4()),
            session_id=session_id,
            user_id=participant_config['user_id'],
            role=participant_config.get('role', ParticipantRole.VIEWER.value),
            permissions=participant_config.get('permissions', {}),
            joined_at=datetime.utcnow(),
            status='active',
            added_by=added_by
        )
        
        self.db.add(participant)
        
        # Send notification to participant
        await self._send_collaboration_notification(
            participant_config['user_id'],
            'collaboration_invitation',
            {
                'session_id': session_id,
                'message': f"You've been invited to collaborate",
                'added_by': added_by
            }
        )
        
        return participant
    
    async def _initialize_real_time_editing(self, session_id: str, config: Dict[str, Any]):
        """Initialize real-time editing capabilities"""
        
        # Set up document collaboration infrastructure
        editing_config = config.get('real_time_editing', {})
        
        # Create document collaboration record
        document_collaboration = RacineCollaborationDocument(
            id=str(uuid.uuid4()),
            session_id=session_id,
            document_type=editing_config.get('document_type', 'text'),
            content_schema=editing_config.get('schema', {}),
            version_control_enabled=editing_config.get('version_control', True),
            lock_configuration=editing_config.get('lock_config', {}),
            auto_save_interval=editing_config.get('auto_save_interval', 5),
            status='active'
        )
        
        self.db.add(document_collaboration)
        
        # Initialize WebSocket infrastructure for real-time updates
        self._active_sessions[session_id] = set()
    
    async def _initialize_expert_consultation(self, session_id: str, config: Dict[str, Any]):
        """Initialize expert consultation network"""
        
        consultation_config = config.get('expert_consultation', {})
        expertise_required = consultation_config.get('expertise_required', [])
        
        # Find and invite relevant experts
        experts = await self._find_experts_by_expertise(expertise_required)
        
        for expert in experts:
            # Create expert network entry
            expert_entry = RacineExpertNetwork(
                id=str(uuid.uuid4()),
                session_id=session_id,
                expert_user_id=expert['user_id'],
                expertise_areas=expert['expertise'],
                availability_status='available',
                consultation_history={},
                rating=expert.get('rating', 0),
                specializations=expert.get('specializations', []),
                status='active'
            )
            
            self.db.add(expert_entry)
            
            # Send expert consultation request
            await self._send_expert_consultation_request(
                expert['user_id'],
                session_id,
                consultation_config
            )
    
    async def _initialize_workflow_collaboration(self, session_id: str, config: Dict[str, Any]):
        """Initialize workflow collaboration features"""
        
        workflow_config = config.get('workflow_collaboration', {})
        
        # Create workflow collaboration record
        workflow_collaboration = RacineCollaborationWorkflow(
            id=str(uuid.uuid4()),
            session_id=session_id,
            workflow_type=workflow_config.get('type', 'general'),
            workflow_definition=workflow_config.get('definition', {}),
            collaboration_rules=workflow_config.get('rules', {}),
            approval_workflow=workflow_config.get('approval_workflow', {}),
            task_assignments={},
            status='active'
        )
        
        self.db.add(workflow_collaboration)
    
    async def _initialize_collaboration_analytics(self, session_id: str):
        """Initialize analytics tracking for collaboration session"""
        
        analytics = RacineCollaborationAnalytics(
            id=str(uuid.uuid4()),
            session_id=session_id,
            metrics_configuration={
                'track_participation': True,
                'track_contributions': True,
                'track_engagement': True,
                'track_productivity': True
            },
            aggregation_rules={
                'time_buckets': ['1h', '1d', '1w'],
                'participation_metrics': ['messages', 'edits', 'reactions'],
                'engagement_metrics': ['time_spent', 'interactions', 'contributions']
            },
            retention_policy='90d',
            status='active'
        )
        
        self.db.add(analytics)
    
    async def join_collaboration_session(
        self, 
        session_id: str, 
        user_id: str,
        connection_info: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Join an active collaboration session
        
        Args:
            session_id: Session to join
            user_id: User joining the session
            connection_info: Optional connection information (e.g., WebSocket)
            
        Returns:
            Session join information
        """
        try:
            # Verify session exists and user has access
            session = self.db.query(RacineCollaborationSession).filter(
                RacineCollaborationSession.id == session_id,
                RacineCollaborationSession.status == 'active'
            ).first()
            
            if not session:
                raise Exception(f"Session {session_id} not found or inactive")
            
            # Check participant permissions
            participant = self.db.query(RacineCollaborationParticipant).filter(
                RacineCollaborationParticipant.session_id == session_id,
                RacineCollaborationParticipant.user_id == user_id,
                RacineCollaborationParticipant.status == 'active'
            ).first()
            
            if not participant:
                raise Exception(f"User {user_id} not authorized for session {session_id}")
            
            # Add to active participants
            if session_id not in self._session_participants:
                self._session_participants[session_id] = set()
            self._session_participants[session_id].add(user_id)
            
            # Update participant status
            participant.last_active = datetime.utcnow()
            participant.connection_status = 'connected'
            
            # Get session context and history
            session_data = await self._get_session_context(session_id, user_id)
            
            # Notify other participants of join
            await self._broadcast_session_event(
                session_id,
                'participant_joined',
                {
                    'user_id': user_id,
                    'timestamp': datetime.utcnow().isoformat()
                },
                exclude_user=user_id
            )
            
            # Track analytics
            await self._track_collaboration_event(
                session_id,
                user_id,
                'session_joined',
                {'connection_info': connection_info}
            )
            
            self.db.commit()
            
            return {
                'session_id': session_id,
                'participant_role': participant.role,
                'permissions': participant.permissions,
                'session_data': session_data,
                'active_participants': list(self._session_participants.get(session_id, set())),
                'status': 'joined'
            }
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to join collaboration session: {str(e)}")
    
    async def _get_session_context(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """Get collaboration session context and recent history"""
        
        # Get session details
        session = self.db.query(RacineCollaborationSession).filter(
            RacineCollaborationSession.id == session_id
        ).first()
        
        # Get recent messages
        recent_messages = self.db.query(RacineCollaborationMessage).filter(
            RacineCollaborationMessage.session_id == session_id
        ).order_by(desc(RacineCollaborationMessage.timestamp)).limit(50).all()
        
        # Get collaboration documents
        documents = self.db.query(RacineCollaborationDocument).filter(
            RacineCollaborationDocument.session_id == session_id,
            RacineCollaborationDocument.status == 'active'
        ).all()
        
        # Get active workflows
        workflows = self.db.query(RacineCollaborationWorkflow).filter(
            RacineCollaborationWorkflow.session_id == session_id,
            RacineCollaborationWorkflow.status == 'active'
        ).all()
        
        return {
            'session': {
                'id': session.id,
                'name': session.name,
                'description': session.description,
                'type': session.collaboration_type,
                'scope': session.scope
            },
            'recent_messages': [
                {
                    'id': msg.id,
                    'sender_id': msg.sender_id,
                    'content': msg.content,
                    'type': msg.message_type,
                    'timestamp': msg.timestamp.isoformat()
                }
                for msg in recent_messages
            ],
            'documents': [
                {
                    'id': doc.id,
                    'type': doc.document_type,
                    'version': doc.current_version,
                    'last_modified': doc.updated_at.isoformat()
                }
                for doc in documents
            ],
            'workflows': [
                {
                    'id': wf.id,
                    'type': wf.workflow_type,
                    'status': wf.status,
                    'tasks': len(wf.task_assignments)
                }
                for wf in workflows
            ]
        }
    
    async def send_collaboration_message(
        self, 
        session_id: str, 
        sender_id: str,
        content: str,
        message_type: str = MessageType.TEXT.value,
        metadata: Dict[str, Any] = None
    ) -> RacineCollaborationMessage:
        """
        Send message in collaboration session
        
        Args:
            session_id: Target session
            sender_id: Message sender
            content: Message content
            message_type: Type of message
            metadata: Optional message metadata
            
        Returns:
            Created message
        """
        try:
            # Create message record
            message = RacineCollaborationMessage(
                id=str(uuid.uuid4()),
                session_id=session_id,
                sender_id=sender_id,
                content=content,
                message_type=message_type,
                metadata=metadata or {},
                timestamp=datetime.utcnow(),
                status='sent'
            )
            
            self.db.add(message)
            self.db.flush()
            
            # Process message for special features
            await self._process_message_features(message)
            
            # Broadcast to session participants
            await self._broadcast_session_event(
                session_id,
                'new_message',
                {
                    'message_id': message.id,
                    'sender_id': sender_id,
                    'content': content,
                    'type': message_type,
                    'timestamp': message.timestamp.isoformat()
                },
                exclude_user=sender_id
            )
            
            # Track analytics
            await self._track_collaboration_event(
                session_id,
                sender_id,
                'message_sent',
                {'message_type': message_type, 'content_length': len(content)}
            )
            
            self.db.commit()
            
            return message
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to send collaboration message: {str(e)}")
    
    async def _process_message_features(self, message: RacineCollaborationMessage):
        """Process message for special features like mentions, AI analysis, etc."""
        
        content = message.content
        metadata = message.metadata
        
        # Process mentions
        mentions = self._extract_mentions(content)
        if mentions:
            metadata['mentions'] = mentions
            # Send notifications to mentioned users
            for mentioned_user in mentions:
                await self._send_collaboration_notification(
                    mentioned_user,
                    'mention',
                    {
                        'message_id': message.id,
                        'session_id': message.session_id,
                        'sender_id': message.sender_id,
                        'content_preview': content[:100]
                    }
                )
        
        # AI content analysis for insights
        if len(content) > 50:  # Only analyze substantial messages
            try:
                ai_insights = await self.ai_service.analyze_collaboration_content(
                    content=content,
                    context={'session_id': message.session_id}
                )
                metadata['ai_insights'] = ai_insights
            except Exception as e:
                print(f"AI analysis failed: {str(e)}")
        
        # Update message metadata
        message.metadata = metadata
    
    def _extract_mentions(self, content: str) -> List[str]:
        """Extract user mentions from message content"""
        import re
        mention_pattern = r'@(\w+)'
        matches = re.findall(mention_pattern, content)
        return matches
    
    async def collaborate_on_document(
        self, 
        session_id: str, 
        document_id: str,
        user_id: str,
        operation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Collaborate on document with real-time synchronization
        
        Args:
            session_id: Collaboration session
            document_id: Document being edited
            user_id: User making changes
            operation: Edit operation details
            
        Returns:
            Operation result and document state
        """
        try:
            # Get document collaboration record
            doc_collab = self.db.query(RacineCollaborationDocument).filter(
                RacineCollaborationDocument.session_id == session_id,
                RacineCollaborationDocument.id == document_id
            ).first()
            
            if not doc_collab:
                raise Exception(f"Document collaboration not found")
            
            # Check if document is locked
            if document_id in self._document_locks:
                lock_owner = self._document_locks[document_id]
                if lock_owner != user_id:
                    raise Exception(f"Document is locked by another user: {lock_owner}")
            
            # Apply operation based on type
            operation_type = operation.get('type')
            result = {}
            
            if operation_type == 'edit':
                result = await self._apply_document_edit(doc_collab, user_id, operation)
            elif operation_type == 'lock':
                result = await self._lock_document(document_id, user_id, operation)
            elif operation_type == 'unlock':
                result = await self._unlock_document(document_id, user_id)
            elif operation_type == 'comment':
                result = await self._add_document_comment(doc_collab, user_id, operation)
            
            # Broadcast change to other collaborators
            await self._broadcast_session_event(
                session_id,
                'document_update',
                {
                    'document_id': document_id,
                    'user_id': user_id,
                    'operation': operation,
                    'result': result,
                    'timestamp': datetime.utcnow().isoformat()
                },
                exclude_user=user_id
            )
            
            # Track analytics
            await self._track_collaboration_event(
                session_id,
                user_id,
                'document_collaboration',
                {'operation_type': operation_type, 'document_id': document_id}
            )
            
            self.db.commit()
            
            return result
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to collaborate on document: {str(e)}")
    
    async def _apply_document_edit(
        self, 
        doc_collab: RacineCollaborationDocument, 
        user_id: str, 
        operation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Apply edit operation to document"""
        
        # Get current content
        current_content = doc_collab.current_content or {}
        
        # Apply edit operation (simplified - in practice would use operational transform)
        edit_data = operation.get('data', {})
        position = edit_data.get('position', 0)
        content = edit_data.get('content', '')
        edit_type = edit_data.get('edit_type', 'insert')
        
        # Update document content
        if edit_type == 'insert':
            # Insert content at position
            current_content[f'edit_{uuid.uuid4()}'] = {
                'position': position,
                'content': content,
                'user_id': user_id,
                'timestamp': datetime.utcnow().isoformat()
            }
        elif edit_type == 'delete':
            # Mark content as deleted
            current_content[f'delete_{uuid.uuid4()}'] = {
                'position': position,
                'length': edit_data.get('length', 1),
                'user_id': user_id,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        # Update document
        doc_collab.current_content = current_content
        doc_collab.current_version += 1
        doc_collab.last_modified_by = user_id
        doc_collab.updated_at = datetime.utcnow()
        
        return {
            'success': True,
            'version': doc_collab.current_version,
            'content': current_content
        }
    
    async def _lock_document(self, document_id: str, user_id: str, operation: Dict[str, Any]) -> Dict[str, Any]:
        """Lock document for exclusive editing"""
        
        if document_id in self._document_locks:
            return {'success': False, 'reason': 'Document already locked'}
        
        lock_duration = operation.get('duration', 300)  # 5 minutes default
        self._document_locks[document_id] = user_id
        
        # Schedule automatic unlock
        async def auto_unlock():
            await asyncio.sleep(lock_duration)
            if document_id in self._document_locks and self._document_locks[document_id] == user_id:
                del self._document_locks[document_id]
        
        asyncio.create_task(auto_unlock())
        
        return {'success': True, 'locked_by': user_id, 'duration': lock_duration}
    
    async def _unlock_document(self, document_id: str, user_id: str) -> Dict[str, Any]:
        """Unlock document"""
        
        if document_id not in self._document_locks:
            return {'success': False, 'reason': 'Document not locked'}
        
        if self._document_locks[document_id] != user_id:
            return {'success': False, 'reason': 'Not the lock owner'}
        
        del self._document_locks[document_id]
        
        return {'success': True}
    
    async def _add_document_comment(
        self, 
        doc_collab: RacineCollaborationDocument, 
        user_id: str, 
        operation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Add comment to document"""
        
        comment_data = operation.get('data', {})
        
        comment = RacineCollaborationComment(
            id=str(uuid.uuid4()),
            collaboration_id=doc_collab.session_id,
            target_type='document',
            target_id=doc_collab.id,
            author_id=user_id,
            content=comment_data.get('content', ''),
            position_reference=comment_data.get('position', {}),
            parent_comment_id=comment_data.get('parent_id'),
            status='active'
        )
        
        self.db.add(comment)
        
        return {
            'success': True,
            'comment_id': comment.id,
            'content': comment.content
        }
    
    async def request_expert_consultation(
        self, 
        request: ExpertConsultationRequest,
        requester_id: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Request expert consultation for specific topic
        
        Args:
            request: Expert consultation request details
            requester_id: User requesting consultation
            session_id: Optional existing session to link
            
        Returns:
            Consultation request result
        """
        try:
            # Find matching experts
            experts = await self._find_experts_by_expertise(request.expertise_required)
            
            if not experts:
                return {
                    'success': False,
                    'message': 'No experts found for requested expertise areas'
                }
            
            # Create or join collaboration session
            if not session_id:
                # Create new expert consultation session
                config = CollaborationConfiguration(
                    name=f"Expert Consultation: {request.topic}",
                    description=request.description,
                    collaboration_type=CollaborationType.EXPERT_CONSULTATION,
                    scope=CollaborationScope.PROJECT,
                    participants=[{'user_id': requester_id, 'role': 'owner'}],
                    settings={
                        'expert_consultation': {
                            'topic': request.topic,
                            'expertise_required': request.expertise_required,
                            'urgency': request.urgency,
                            'context_groups': request.context_groups or []
                        }
                    }
                )
                
                session = await self.create_collaboration_session(config, requester_id)
                session_id = session.id
            
            # Invite experts to session
            invited_experts = []
            for expert in experts[:5]:  # Limit to top 5 experts
                try:
                    # Add expert as participant
                    await self._add_session_participant(
                        session_id,
                        {
                            'user_id': expert['user_id'],
                            'role': ParticipantRole.EXPERT.value,
                            'permissions': {
                                'can_view': True,
                                'can_comment': True,
                                'can_recommend': True,
                                'can_invite_others': False
                            }
                        },
                        requester_id
                    )
                    
                    # Send expert consultation request
                    await self._send_expert_consultation_request(
                        expert['user_id'],
                        session_id,
                        {
                            'topic': request.topic,
                            'description': request.description,
                            'urgency': request.urgency,
                            'requester_id': requester_id
                        }
                    )
                    
                    invited_experts.append(expert)
                    
                except Exception as e:
                    print(f"Failed to invite expert {expert['user_id']}: {str(e)}")
            
            self.db.commit()
            
            return {
                'success': True,
                'session_id': session_id,
                'invited_experts': len(invited_experts),
                'expert_details': invited_experts
            }
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to request expert consultation: {str(e)}")
    
    async def _find_experts_by_expertise(self, expertise_areas: List[str]) -> List[Dict[str, Any]]:
        """Find experts matching required expertise areas"""
        
        # Check cache first
        cache_key = ':'.join(sorted(expertise_areas))
        if cache_key in self._expert_cache:
            cached_data, timestamp = self._expert_cache[cache_key]
            if datetime.utcnow().timestamp() - timestamp < 3600:  # 1 hour cache
                return cached_data
        
        # Query expert network
        expert_query = self.db.query(RacineExpertNetwork).filter(
            RacineExpertNetwork.status == 'active',
            RacineExpertNetwork.availability_status.in_(['available', 'limited'])
        )
        
        experts = []
        for expert_record in expert_query.all():
            # Check expertise match
            expert_expertise = expert_record.expertise_areas
            match_score = self._calculate_expertise_match(expertise_areas, expert_expertise)
            
            if match_score > 0.3:  # Minimum 30% match
                experts.append({
                    'user_id': expert_record.expert_user_id,
                    'expertise': expert_expertise,
                    'specializations': expert_record.specializations,
                    'rating': expert_record.rating,
                    'availability': expert_record.availability_status,
                    'match_score': match_score
                })
        
        # Sort by match score and rating
        experts.sort(key=lambda x: (x['match_score'] * x['rating']), reverse=True)
        
        # Cache results
        self._expert_cache[cache_key] = (experts, datetime.utcnow().timestamp())
        
        return experts
    
    def _calculate_expertise_match(self, required: List[str], available: List[str]) -> float:
        """Calculate match score between required and available expertise"""
        
        if not required or not available:
            return 0.0
        
        required_set = set(req.lower() for req in required)
        available_set = set(avail.lower() for avail in available)
        
        intersection = required_set.intersection(available_set)
        union = required_set.union(available_set)
        
        # Jaccard similarity
        return len(intersection) / len(union) if union else 0.0
    
    async def _send_expert_consultation_request(
        self, 
        expert_id: str, 
        session_id: str, 
        request_data: Dict[str, Any]
    ):
        """Send expert consultation request notification"""
        
        await self._send_collaboration_notification(
            expert_id,
            'expert_consultation_request',
            {
                'session_id': session_id,
                'topic': request_data['topic'],
                'description': request_data['description'],
                'urgency': request_data['urgency'],
                'requester_id': request_data['requester_id']
            }
        )
    
    async def get_collaboration_analytics(
        self, 
        session_id: str, 
        time_range: str = '7d'
    ) -> Dict[str, Any]:
        """
        Get collaboration analytics for session
        
        Args:
            session_id: Session to analyze
            time_range: Time range for analytics
            
        Returns:
            Collaboration analytics data
        """
        try:
            # Get analytics configuration
            analytics_config = self.db.query(RacineCollaborationAnalytics).filter(
                RacineCollaborationAnalytics.session_id == session_id
            ).first()
            
            if not analytics_config:
                return {'error': 'Analytics not configured for session'}
            
            # Calculate time range
            end_time = datetime.utcnow()
            if time_range == '7d':
                start_time = end_time - timedelta(days=7)
            elif time_range == '1d':
                start_time = end_time - timedelta(days=1)
            else:
                start_time = end_time - timedelta(hours=1)
            
            # Collect participation metrics
            participation_metrics = await self._calculate_participation_metrics(
                session_id, start_time, end_time
            )
            
            # Collect engagement metrics
            engagement_metrics = await self._calculate_engagement_metrics(
                session_id, start_time, end_time
            )
            
            # Collect productivity metrics
            productivity_metrics = await self._calculate_productivity_metrics(
                session_id, start_time, end_time
            )
            
            # Collect collaboration quality metrics
            quality_metrics = await self._calculate_collaboration_quality_metrics(
                session_id, start_time, end_time
            )
            
            return {
                'session_id': session_id,
                'time_range': time_range,
                'generated_at': datetime.utcnow().isoformat(),
                'participation': participation_metrics,
                'engagement': engagement_metrics,
                'productivity': productivity_metrics,
                'quality': quality_metrics
            }
            
        except Exception as e:
            raise Exception(f"Failed to get collaboration analytics: {str(e)}")
    
    async def _calculate_participation_metrics(
        self, 
        session_id: str, 
        start_time: datetime, 
        end_time: datetime
    ) -> Dict[str, Any]:
        """Calculate participation metrics"""
        
        # Message participation
        message_counts = self.db.query(
            RacineCollaborationMessage.sender_id,
            func.count(RacineCollaborationMessage.id).label('message_count')
        ).filter(
            RacineCollaborationMessage.session_id == session_id,
            RacineCollaborationMessage.timestamp >= start_time,
            RacineCollaborationMessage.timestamp <= end_time
        ).group_by(RacineCollaborationMessage.sender_id).all()
        
        # Document collaboration participation
        document_edits = self.db.query(
            RacineCollaborationDocument.last_modified_by,
            func.count(RacineCollaborationDocument.id).label('edit_count')
        ).filter(
            RacineCollaborationDocument.session_id == session_id,
            RacineCollaborationDocument.updated_at >= start_time,
            RacineCollaborationDocument.updated_at <= end_time
        ).group_by(RacineCollaborationDocument.last_modified_by).all()
        
        # Comment participation
        comment_counts = self.db.query(
            RacineCollaborationComment.author_id,
            func.count(RacineCollaborationComment.id).label('comment_count')
        ).filter(
            RacineCollaborationComment.collaboration_id == session_id,
            RacineCollaborationComment.created_at >= start_time,
            RacineCollaborationComment.created_at <= end_time
        ).group_by(RacineCollaborationComment.author_id).all()
        
        return {
            'total_messages': sum(count for _, count in message_counts),
            'total_edits': sum(count for _, count in document_edits),
            'total_comments': sum(count for _, count in comment_counts),
            'active_participants': len(set(
                [sender for sender, _ in message_counts] +
                [editor for editor, _ in document_edits] +
                [author for author, _ in comment_counts]
            )),
            'message_distribution': dict(message_counts),
            'edit_distribution': dict(document_edits),
            'comment_distribution': dict(comment_counts)
        }
    
    async def _calculate_engagement_metrics(
        self, 
        session_id: str, 
        start_time: datetime, 
        end_time: datetime
    ) -> Dict[str, Any]:
        """Calculate engagement metrics"""
        
        # Session duration and frequency
        participants = self.db.query(RacineCollaborationParticipant).filter(
            RacineCollaborationParticipant.session_id == session_id,
            RacineCollaborationParticipant.status == 'active'
        ).all()
        
        engagement_data = {}
        for participant in participants:
            user_id = participant.user_id
            
            # Calculate time spent (simplified - would track connection times in real implementation)
            user_messages = self.db.query(RacineCollaborationMessage).filter(
                RacineCollaborationMessage.session_id == session_id,
                RacineCollaborationMessage.sender_id == user_id,
                RacineCollaborationMessage.timestamp >= start_time,
                RacineCollaborationMessage.timestamp <= end_time
            ).order_by(RacineCollaborationMessage.timestamp).all()
            
            if user_messages:
                first_activity = user_messages[0].timestamp
                last_activity = user_messages[-1].timestamp
                session_duration = (last_activity - first_activity).total_seconds()
                
                engagement_data[user_id] = {
                    'session_duration': session_duration,
                    'message_frequency': len(user_messages) / max(session_duration / 3600, 0.1),  # messages per hour
                    'first_activity': first_activity.isoformat(),
                    'last_activity': last_activity.isoformat()
                }
        
        return {
            'average_session_duration': sum(
                data['session_duration'] for data in engagement_data.values()
            ) / len(engagement_data) if engagement_data else 0,
            'total_engagement_time': sum(
                data['session_duration'] for data in engagement_data.values()
            ),
            'user_engagement': engagement_data
        }
    
    async def _calculate_productivity_metrics(
        self, 
        session_id: str, 
        start_time: datetime, 
        end_time: datetime
    ) -> Dict[str, Any]:
        """Calculate productivity metrics"""
        
        # Document creation/modification rates
        document_activities = self.db.query(RacineCollaborationDocument).filter(
            RacineCollaborationDocument.session_id == session_id,
            RacineCollaborationDocument.updated_at >= start_time,
            RacineCollaborationDocument.updated_at <= end_time
        ).count()
        
        # Task completion (if workflow collaboration)
        workflow_tasks = self.db.query(RacineCollaborationWorkflow).filter(
            RacineCollaborationWorkflow.session_id == session_id
        ).first()
        
        completed_tasks = 0
        total_tasks = 0
        if workflow_tasks:
            task_assignments = workflow_tasks.task_assignments or {}
            total_tasks = len(task_assignments)
            completed_tasks = sum(
                1 for task in task_assignments.values()
                if task.get('status') == 'completed'
            )
        
        # Resolution rate (expert consultations)
        expert_sessions = self.db.query(RacineExpertNetwork).filter(
            RacineExpertNetwork.session_id == session_id
        ).count()
        
        return {
            'document_activities': document_activities,
            'task_completion_rate': completed_tasks / total_tasks if total_tasks > 0 else 0,
            'expert_consultations': expert_sessions,
            'productivity_score': self._calculate_productivity_score(
                document_activities, completed_tasks, total_tasks
            )
        }
    
    def _calculate_productivity_score(
        self, 
        document_activities: int, 
        completed_tasks: int, 
        total_tasks: int
    ) -> float:
        """Calculate overall productivity score"""
        
        doc_score = min(document_activities / 10, 1.0)  # Normalize to 0-1
        task_score = completed_tasks / total_tasks if total_tasks > 0 else 0
        
        return (doc_score + task_score) / 2
    
    async def _calculate_collaboration_quality_metrics(
        self, 
        session_id: str, 
        start_time: datetime, 
        end_time: datetime
    ) -> Dict[str, Any]:
        """Calculate collaboration quality metrics"""
        
        # Response time analysis
        messages = self.db.query(RacineCollaborationMessage).filter(
            RacineCollaborationMessage.session_id == session_id,
            RacineCollaborationMessage.timestamp >= start_time,
            RacineCollaborationMessage.timestamp <= end_time
        ).order_by(RacineCollaborationMessage.timestamp).all()
        
        response_times = []
        for i in range(1, len(messages)):
            if messages[i].sender_id != messages[i-1].sender_id:
                response_time = (messages[i].timestamp - messages[i-1].timestamp).total_seconds()
                response_times.append(response_time)
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Conflict resolution (document locks, version conflicts)
        conflict_events = 0  # Would track actual conflicts in production
        
        # Expert contribution quality
        expert_contributions = self.db.query(RacineCollaborationMessage).filter(
            RacineCollaborationMessage.session_id == session_id,
            RacineCollaborationMessage.timestamp >= start_time,
            RacineCollaborationMessage.timestamp <= end_time,
            RacineCollaborationMessage.metadata.contains({"expert_contribution": True})
        ).count()
        
        return {
            'average_response_time': avg_response_time,
            'conflict_events': conflict_events,
            'expert_contributions': expert_contributions,
            'quality_score': self._calculate_quality_score(
                avg_response_time, conflict_events, expert_contributions
            )
        }
    
    def _calculate_quality_score(
        self, 
        avg_response_time: float, 
        conflict_events: int, 
        expert_contributions: int
    ) -> float:
        """Calculate overall collaboration quality score"""
        
        # Lower response time is better (normalize to 0-1, where 1 is best)
        response_score = max(0, 1 - avg_response_time / 3600)  # 1 hour = 0 score
        
        # Fewer conflicts is better
        conflict_score = max(0, 1 - conflict_events / 10)  # 10 conflicts = 0 score
        
        # More expert contributions is better
        expert_score = min(expert_contributions / 5, 1.0)  # 5 contributions = 1 score
        
        return (response_score + conflict_score + expert_score) / 3
    
    async def _broadcast_session_event(
        self, 
        session_id: str, 
        event_type: str, 
        event_data: Dict[str, Any],
        exclude_user: Optional[str] = None
    ):
        """Broadcast event to all session participants"""
        
        if session_id not in self._active_sessions:
            return
        
        event_message = {
            'type': event_type,
            'session_id': session_id,
            'data': event_data,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Send real-time WebSocket messages to collaboration session participants
        await self._broadcast_to_session_participants(session_id, event_type, event_data)
        await self._track_session_event(session_id, event_type, event_data)
    
    async def _track_collaboration_event(
        self, 
        session_id: str, 
        user_id: str,
        event_type: str, 
        event_data: Dict[str, Any]
    ):
        """Track collaboration event for analytics"""
        
        # This would typically store events in a time-series database
        # For now, we'll just log the event
        print(f"Collaboration Event: {session_id}, {user_id}, {event_type}, {event_data}")
    
    async def _track_session_event(
        self, 
        session_id: str, 
        event_type: str, 
        event_data: Dict[str, Any]
    ):
        """Track session-level events"""
        
        print(f"Session Event: {session_id}, {event_type}, {event_data}")
    
    async def _send_collaboration_notification(
        self, 
        user_id: str, 
        notification_type: str, 
        data: Dict[str, Any]
    ):
        """Send notification to user"""
        
        notification = RacineCollaborationNotification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            notification_type=notification_type,
            content=data,
            status='pending',
            created_at=datetime.utcnow()
        )
        
        self.db.add(notification)
        
        # Use notification service if available
        try:
            await self.notification_service.send_notification(
                user_id=user_id,
                title=notification_type.replace('_', ' ').title(),
                message=str(data),
                notification_type=notification_type
            )
        except Exception as e:
            print(f"Failed to send notification: {str(e)}")
    
    async def leave_collaboration_session(
        self, 
        session_id: str, 
        user_id: str
    ) -> Dict[str, Any]:
        """
        Leave collaboration session
        
        Args:
            session_id: Session to leave
            user_id: User leaving the session
            
        Returns:
            Leave operation result
        """
        try:
            # Remove from active participants
            if session_id in self._session_participants:
                self._session_participants[session_id].discard(user_id)
            
            # Update participant status
            participant = self.db.query(RacineCollaborationParticipant).filter(
                RacineCollaborationParticipant.session_id == session_id,
                RacineCollaborationParticipant.user_id == user_id
            ).first()
            
            if participant:
                participant.connection_status = 'disconnected'
                participant.last_active = datetime.utcnow()
            
            # Release any document locks
            documents_to_unlock = [
                doc_id for doc_id, lock_user in self._document_locks.items()
                if lock_user == user_id
            ]
            
            for doc_id in documents_to_unlock:
                del self._document_locks[doc_id]
            
            # Notify other participants
            await self._broadcast_session_event(
                session_id,
                'participant_left',
                {
                    'user_id': user_id,
                    'timestamp': datetime.utcnow().isoformat(),
                    'released_locks': documents_to_unlock
                },
                exclude_user=user_id
            )
            
            # Track analytics
            await self._track_collaboration_event(
                session_id,
                user_id,
                'session_left',
                {'released_locks': len(documents_to_unlock)}
            )
            
            self.db.commit()
            
            return {
                'success': True,
                'session_id': session_id,
                'released_locks': documents_to_unlock
            }
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to leave collaboration session: {str(e)}")
    
    async def get_user_collaboration_sessions(
        self, 
        user_id: str, 
        status: str = 'active'
    ) -> List[Dict[str, Any]]:
        """
        Get all collaboration sessions for a user
        
        Args:
            user_id: User identifier
            status: Session status filter
            
        Returns:
            List of user collaboration sessions
        """
        try:
            # Get user's collaboration sessions
            participant_sessions = self.db.query(RacineCollaborationSession).join(
                RacineCollaborationParticipant,
                RacineCollaborationSession.id == RacineCollaborationParticipant.session_id
            ).filter(
                RacineCollaborationParticipant.user_id == user_id,
                RacineCollaborationParticipant.status == 'active',
                RacineCollaborationSession.status == status
            ).all()
            
            sessions_data = []
            for session in participant_sessions:
                # Get participant count
                participant_count = self.db.query(func.count(RacineCollaborationParticipant.id)).filter(
                    RacineCollaborationParticipant.session_id == session.id,
                    RacineCollaborationParticipant.status == 'active'
                ).scalar()
                
                # Get recent activity
                last_message = self.db.query(RacineCollaborationMessage).filter(
                    RacineCollaborationMessage.session_id == session.id
                ).order_by(desc(RacineCollaborationMessage.timestamp)).first()
                
                sessions_data.append({
                    'id': session.id,
                    'name': session.name,
                    'description': session.description,
                    'type': session.collaboration_type,
                    'scope': session.scope,
                    'participant_count': participant_count,
                    'last_activity': last_message.timestamp.isoformat() if last_message else None,
                    'created_at': session.created_at.isoformat(),
                    'workspace_id': session.workspace_id
                })
            
            return sessions_data
            
        except Exception as e:
            raise Exception(f"Failed to get user collaboration sessions: {str(e)}")
    
    async def _broadcast_to_session_participants(self, session_id: str, event_type: str, event_data: dict):
        """Broadcast real-time events to all session participants via WebSocket"""
        try:
            from app.models.racine_models.racine_collaboration_models import CollaborationSession
            from app.db_session import get_db_session
            import json
            
            async with get_db_session() as session:
                # Get collaboration session
                collaboration_session = await session.get(CollaborationSession, session_id)
                if not collaboration_session:
                    logger.warning(f"Collaboration session {session_id} not found for broadcasting")
                    return
                
                # Get all active participants
                participants = collaboration_session.participants or []
                
                # Prepare WebSocket message
                message = {
                    "type": "collaboration_event",
                    "session_id": session_id,
                    "event_type": event_type,
                    "data": event_data,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # Broadcast to all participants via WebSocket manager
                await self._send_websocket_messages(participants, message)
                
        except Exception as e:
            logger.error(f"Error broadcasting to session participants: {str(e)}")
    
    async def _send_websocket_messages(self, participants: list, message: dict):
        """Send WebSocket messages to all participants"""
        try:
            from app.api.routes.websocket_routes import websocket_manager
            import json
            
            message_json = json.dumps(message)
            
            # Send message to each participant
            for participant in participants:
                user_id = participant.get("user_id")
                if user_id:
                    await websocket_manager.send_personal_message(message_json, user_id)
                    
        except Exception as e:
            logger.error(f"Error sending WebSocket messages: {str(e)}")
    
    async def _notify_collaboration_activity(self, session_id: str, activity_type: str, details: dict):
        """Send notifications about collaboration activities"""
        try:
            from app.services.notification_service import NotificationService
            
            notification_service = NotificationService()
            
            # Create notification for collaboration activity
            await notification_service.create_collaboration_notification(
                session_id=session_id,
                activity_type=activity_type,
                details=details
            )
            
        except Exception as e:
            logger.error(f"Error sending collaboration notification: {str(e)}")
    
    async def _update_session_analytics(self, session_id: str, event_type: str, participant_count: int):
        """Update analytics for collaboration session"""
        try:
            from app.models.racine_models.racine_collaboration_models import CollaborationAnalytics
            from app.db_session import get_db_session
            
            async with get_db_session() as session:
                # Get or create analytics record
                analytics = await session.execute(
                    select(CollaborationAnalytics).where(
                        CollaborationAnalytics.session_id == session_id
                    )
                )
                analytics = analytics.scalar_one_or_none()
                
                if not analytics:
                    analytics = CollaborationAnalytics(
                        session_id=session_id,
                        total_events=0,
                        total_participants=participant_count,
                        created_at=datetime.utcnow()
                    )
                    session.add(analytics)
                
                # Update analytics
                analytics.total_events += 1
                analytics.last_activity = datetime.utcnow()
                analytics.total_participants = max(analytics.total_participants, participant_count)
                
                await session.commit()
                
        except Exception as e:
            logger.error(f"Error updating session analytics: {str(e)}")
    
    async def _cleanup_inactive_sessions(self):
        """Clean up inactive collaboration sessions"""
        try:
            from app.models.racine_models.racine_collaboration_models import CollaborationSession
            from app.db_session import get_db_session
            
            # Define inactive threshold (24 hours)
            inactive_threshold = datetime.utcnow() - timedelta(hours=24)
            
            async with get_db_session() as session:
                # Find inactive sessions
                inactive_sessions = await session.execute(
                    select(CollaborationSession).where(
                        CollaborationSession.last_activity < inactive_threshold,
                        CollaborationSession.status == "active"
                    )
                )
                inactive_sessions = inactive_sessions.scalars().all()
                
                # Mark sessions as inactive
                for session_obj in inactive_sessions:
                    session_obj.status = "inactive"
                    session_obj.ended_at = datetime.utcnow()
                
                await session.commit()
                logger.info(f"Cleaned up {len(inactive_sessions)} inactive collaboration sessions")
                
        except Exception as e:
            logger.error(f"Error cleaning up inactive sessions: {str(e)}")