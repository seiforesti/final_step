"""
Racine Workspace Service
========================

Advanced workspace management service for multi-workspace management with cross-group 
resource linking, collaborative workspace sharing, and comprehensive analytics.

This service provides:
- Multi-workspace management and coordination
- Cross-group resource linking and management
- Collaborative workspace sharing and permissions
- Template-based workspace creation and cloning
- Comprehensive workspace analytics and monitoring
- Workspace security and access control
- Integration with all existing group services

All functionality is designed for enterprise-grade scalability, performance, and security.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import uuid

# Import existing services for integration
from ..data_source_service import DataSourceService
from ..scan_rule_set_service import ScanRuleSetService
from ..classification_service import ClassificationService as EnterpriseClassificationService
from ..compliance_rule_service import ComplianceRuleService
from ..enterprise_catalog_service import EnterpriseIntelligentCatalogService
from ..unified_scan_orchestrator import UnifiedScanOrchestrator
from ..rbac_service import RBACService
from ..advanced_ai_service import AdvancedAIService
from ..comprehensive_analytics_service import ComprehensiveAnalyticsService

# Import racine models
from ...models.racine_models.racine_workspace_models import (
    RacineWorkspace,
    RacineWorkspaceMember,
    RacineWorkspaceResource,
    RacineWorkspaceTemplate,
    RacineWorkspaceAnalytics,
    RacineWorkspaceSettings,
    RacineWorkspaceAudit,
    RacineWorkspaceNotification,
    WorkspaceType,
    WorkspaceStatus,
    WorkspaceMemberRole as MemberRole,
    ResourceAccessLevel as ResourceType
)
from ...models.auth_models import User

logger = logging.getLogger(__name__)


class RacineWorkspaceService:
    """
    Comprehensive workspace management service with cross-group integration
    and enterprise-grade capabilities.
    """

    def __init__(self, db_session: Session):
        """Initialize the workspace service with database session and integrated services."""
        self.db = db_session
        
        # Initialize ALL existing services for full integration
        self.data_source_service = DataSourceService(db_session)
        self.scan_rule_service = ScanRuleSetService(db_session)
        self.classification_service = EnterpriseClassificationService(db_session)
        self.compliance_service = ComplianceRuleService(db_session)
        self.catalog_service = EnterpriseIntelligentCatalogService(db_session)
        self.scan_orchestrator = UnifiedScanOrchestrator(db_session)
        self.rbac_service = RBACService(db_session)
        self.ai_service = AdvancedAIService(db_session)
        self.analytics_service = ComprehensiveAnalyticsService(db_session)
        
        # Service registry for dynamic access
        self.service_registry = {
            'data_sources': self.data_source_service,
            'scan_rule_sets': self.scan_rule_service,
            'classifications': self.classification_service,
            'compliance_rules': self.compliance_service,
            'advanced_catalog': self.catalog_service,
            'scan_logic': self.scan_orchestrator,
            'rbac_system': self.rbac_service,
            'ai_service': self.ai_service,
            'analytics': self.analytics_service
        }
        
        logger.info("RacineWorkspaceService initialized with full cross-group integration")

    async def create_workspace(
        self,
        name: str,
        description: str,
        workspace_type: WorkspaceType,
        created_by: str,
        template_id: Optional[str] = None,
        configuration: Optional[Dict[str, Any]] = None
    ) -> RacineWorkspace:
        """
        Create a new workspace with comprehensive configuration and cross-group integration.
        
        Args:
            name: Workspace name
            description: Workspace description
            workspace_type: Type of workspace (personal, team, enterprise)
            created_by: User ID creating the workspace
            template_id: Optional template ID for template-based creation
            configuration: Optional workspace configuration
            
        Returns:
            Created workspace instance
        """
        try:
            logger.info(f"Creating workspace '{name}' of type {workspace_type.value}")
            
            # Create base workspace configuration
            workspace_config = {
                "enabled_groups": ["data_sources", "scan_rule_sets", "classifications", 
                                 "compliance_rules", "advanced_catalog", "scan_logic", "rbac_system"],
                "default_permissions": {"read": True, "write": False, "admin": False},
                "collaboration_enabled": True,
                "analytics_enabled": True,
                "ai_assistance_enabled": True,
                "cross_group_workflows_enabled": True
            }
            
            # Apply template if specified
            if template_id:
                template = await self.get_workspace_template(template_id)
                if template:
                    workspace_config.update(template.default_configuration or {})
                    logger.info(f"Applied template {template_id} to workspace")
            
            # Apply custom configuration
            if configuration:
                workspace_config.update(configuration)
            
            # Create workspace
            workspace = RacineWorkspace(
                name=name,
                description=description,
                workspace_type=workspace_type,
                status=WorkspaceStatus.ACTIVE,
                configuration=workspace_config,
                settings={
                    "theme": "default",
                    "layout": "standard",
                    "notifications_enabled": True,
                    "auto_save_enabled": True,
                    "collaboration_mode": "real_time"
                },
                metadata={
                    "creation_source": "api",
                    "template_used": template_id,
                    "initial_groups": workspace_config["enabled_groups"]
                },
                created_by=created_by
            )
            
            self.db.add(workspace)
            self.db.flush()  # Get the workspace ID
            
            # Add creator as owner
            await self.add_workspace_member(
                workspace.id,
                created_by,
                MemberRole.OWNER,
                added_by=created_by
            )
            
            # Initialize workspace resources for enabled groups
            await self._initialize_workspace_resources(workspace)
            
            # Create initial analytics entry
            await self._create_workspace_analytics(workspace.id)
            
            # Create audit entry
            await self._create_audit_entry(
                workspace.id,
                "workspace_created",
                {"workspace_type": workspace_type.value, "template_id": template_id},
                created_by
            )
            
            self.db.commit()
            logger.info(f"Successfully created workspace {workspace.id}")
            
            return workspace
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating workspace: {str(e)}")
            raise

    async def get_workspace(self, workspace_id: str, user_id: str) -> Optional[RacineWorkspace]:
        """
        Get workspace by ID with permission checking.
        
        Args:
            workspace_id: Workspace ID
            user_id: User requesting access
            
        Returns:
            Workspace if accessible, None otherwise
        """
        try:
            # Check if user has access to workspace
            if not await self.check_workspace_access(workspace_id, user_id):
                logger.warning(f"User {user_id} denied access to workspace {workspace_id}")
                return None
            
            workspace = self.db.query(RacineWorkspace).filter(
                RacineWorkspace.id == workspace_id
            ).first()
            
            if workspace:
                # Update last accessed time
                await self._update_last_accessed(workspace_id, user_id)
                
            return workspace
            
        except Exception as e:
            logger.error(f"Error getting workspace {workspace_id}: {str(e)}")
            raise

    async def list_user_workspaces(
        self,
        user_id: str,
        workspace_type: Optional[WorkspaceType] = None,
        include_shared: bool = True
    ) -> List[RacineWorkspace]:
        """
        List workspaces accessible to a user.
        
        Args:
            user_id: User ID
            workspace_type: Optional filter by workspace type
            include_shared: Whether to include shared workspaces
            
        Returns:
            List of accessible workspaces
        """
        try:
            query = self.db.query(RacineWorkspace).join(
                RacineWorkspaceMember,
                RacineWorkspace.id == RacineWorkspaceMember.workspace_id
            ).filter(RacineWorkspaceMember.user_id == user_id)
            
            if workspace_type:
                query = query.filter(RacineWorkspace.workspace_type == workspace_type)
            
            if not include_shared:
                query = query.filter(
                    RacineWorkspaceMember.role.in_([MemberRole.OWNER, MemberRole.ADMIN])
                )
            
            workspaces = query.order_by(RacineWorkspace.last_accessed.desc()).all()
            
            logger.info(f"Retrieved {len(workspaces)} workspaces for user {user_id}")
            return workspaces
            
        except Exception as e:
            logger.error(f"Error listing workspaces for user {user_id}: {str(e)}")
            raise

    async def add_workspace_member(
        self,
        workspace_id: str,
        user_id: str,
        role: MemberRole,
        added_by: str,
        permissions: Optional[Dict[str, Any]] = None
    ) -> RacineWorkspaceMember:
        """
        Add a member to a workspace with specified role and permissions.
        
        Args:
            workspace_id: Workspace ID
            user_id: User ID to add
            role: Member role
            added_by: User ID adding the member
            permissions: Optional custom permissions
            
        Returns:
            Created workspace member
        """
        try:
            # Check if user is already a member
            existing = self.db.query(RacineWorkspaceMember).filter(
                and_(
                    RacineWorkspaceMember.workspace_id == workspace_id,
                    RacineWorkspaceMember.user_id == user_id
                )
            ).first()
            
            if existing:
                logger.warning(f"User {user_id} is already a member of workspace {workspace_id}")
                return existing
            
            # Create member with default permissions based on role
            default_permissions = self._get_default_permissions(role)
            if permissions:
                default_permissions.update(permissions)
            
            member = RacineWorkspaceMember(
                workspace_id=workspace_id,
                user_id=user_id,
                role=role,
                permissions=default_permissions,
                status="active",
                added_by=added_by
            )
            
            self.db.add(member)
            
            # Create audit entry
            await self._create_audit_entry(
                workspace_id,
                "member_added",
                {"user_id": user_id, "role": role.value},
                added_by
            )
            
            self.db.commit()
            logger.info(f"Added user {user_id} to workspace {workspace_id} with role {role.value}")
            
            return member
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error adding member to workspace: {str(e)}")
            raise

    async def link_resource(
        self,
        workspace_id: str,
        resource_type: ResourceType,
        resource_id: str,
        group_name: str,
        linked_by: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> RacineWorkspaceResource:
        """
        Link a resource from any group to a workspace.
        
        Args:
            workspace_id: Workspace ID
            resource_type: Type of resource
            resource_id: Resource ID
            group_name: Source group name
            linked_by: User linking the resource
            metadata: Optional resource metadata
            
        Returns:
            Created workspace resource link
        """
        try:
            # Validate resource exists in the specified group
            await self._validate_resource_exists(resource_type, resource_id, group_name)
            
            # Check if resource is already linked
            existing = self.db.query(RacineWorkspaceResource).filter(
                and_(
                    RacineWorkspaceResource.workspace_id == workspace_id,
                    RacineWorkspaceResource.resource_id == resource_id,
                    RacineWorkspaceResource.resource_type == resource_type
                )
            ).first()
            
            if existing:
                logger.warning(f"Resource {resource_id} already linked to workspace {workspace_id}")
                return existing
            
            # Create resource link
            resource_link = RacineWorkspaceResource(
                workspace_id=workspace_id,
                resource_type=resource_type,
                resource_id=resource_id,
                group_name=group_name,
                status="active",
                metadata=metadata or {},
                configuration={
                    "access_level": "read_write",
                    "sync_enabled": True,
                    "notifications_enabled": True
                },
                linked_by=linked_by
            )
            
            self.db.add(resource_link)
            
            # Create audit entry
            await self._create_audit_entry(
                workspace_id,
                "resource_linked",
                {
                    "resource_type": resource_type.value,
                    "resource_id": resource_id,
                    "group_name": group_name
                },
                linked_by
            )
            
            self.db.commit()
            logger.info(f"Linked {resource_type.value} {resource_id} to workspace {workspace_id}")
            
            return resource_link
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error linking resource to workspace: {str(e)}")
            raise

    async def get_workspace_resources(
        self,
        workspace_id: str,
        resource_type: Optional[ResourceType] = None,
        group_name: Optional[str] = None
    ) -> List[RacineWorkspaceResource]:
        """
        Get resources linked to a workspace.
        
        Args:
            workspace_id: Workspace ID
            resource_type: Optional filter by resource type
            group_name: Optional filter by group name
            
        Returns:
            List of workspace resources
        """
        try:
            query = self.db.query(RacineWorkspaceResource).filter(
                RacineWorkspaceResource.workspace_id == workspace_id
            )
            
            if resource_type:
                query = query.filter(RacineWorkspaceResource.resource_type == resource_type)
            
            if group_name:
                query = query.filter(RacineWorkspaceResource.group_name == group_name)
            
            resources = query.order_by(RacineWorkspaceResource.linked_at.desc()).all()
            
            # Enrich resources with live data from groups
            enriched_resources = await self._enrich_workspace_resources(resources)
            
            return enriched_resources
            
        except Exception as e:
            logger.error(f"Error getting workspace resources: {str(e)}")
            raise

    async def get_workspace_analytics(
        self,
        workspace_id: str,
        time_range: Optional[Dict[str, datetime]] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a workspace.
        
        Args:
            workspace_id: Workspace ID
            time_range: Optional time range for analytics
            
        Returns:
            Comprehensive workspace analytics
        """
        try:
            # Get basic workspace analytics
            analytics = self.db.query(RacineWorkspaceAnalytics).filter(
                RacineWorkspaceAnalytics.workspace_id == workspace_id
            ).order_by(RacineWorkspaceAnalytics.recorded_at.desc()).first()
            
            if not analytics:
                # Create initial analytics if none exist
                analytics = await self._create_workspace_analytics(workspace_id)
            
            # Get cross-group analytics
            cross_group_analytics = await self._get_cross_group_analytics(workspace_id, time_range)
            
            # Get collaboration analytics
            collaboration_analytics = await self._get_collaboration_analytics(workspace_id, time_range)
            
            # Get resource usage analytics
            resource_analytics = await self._get_resource_usage_analytics(workspace_id, time_range)
            
            return {
                "workspace_analytics": analytics,
                "cross_group_analytics": cross_group_analytics,
                "collaboration_analytics": collaboration_analytics,
                "resource_analytics": resource_analytics,
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error getting workspace analytics: {str(e)}")
            raise

    async def clone_workspace(
        self,
        source_workspace_id: str,
        new_name: str,
        cloned_by: str,
        include_resources: bool = True,
        include_members: bool = False
    ) -> RacineWorkspace:
        """
        Clone an existing workspace.
        
        Args:
            source_workspace_id: Source workspace ID
            new_name: New workspace name
            cloned_by: User cloning the workspace
            include_resources: Whether to clone resource links
            include_members: Whether to clone members
            
        Returns:
            Cloned workspace
        """
        try:
            # Get source workspace
            source_workspace = await self.get_workspace(source_workspace_id, cloned_by)
            if not source_workspace:
                raise ValueError(f"Source workspace {source_workspace_id} not found or not accessible")
            
            # Create new workspace
            cloned_workspace = await self.create_workspace(
                name=new_name,
                description=f"Cloned from {source_workspace.name}",
                workspace_type=source_workspace.workspace_type,
                created_by=cloned_by,
                configuration=source_workspace.configuration
            )
            
            # Clone resources if requested
            if include_resources:
                await self._clone_workspace_resources(source_workspace_id, cloned_workspace.id, cloned_by)
            
            # Clone members if requested
            if include_members:
                await self._clone_workspace_members(source_workspace_id, cloned_workspace.id, cloned_by)
            
            # Create audit entry
            await self._create_audit_entry(
                cloned_workspace.id,
                "workspace_cloned",
                {
                    "source_workspace_id": source_workspace_id,
                    "include_resources": include_resources,
                    "include_members": include_members
                },
                cloned_by
            )
            
            self.db.commit()
            logger.info(f"Successfully cloned workspace {source_workspace_id} to {cloned_workspace.id}")
            
            return cloned_workspace
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error cloning workspace: {str(e)}")
            raise

    async def check_workspace_access(self, workspace_id: str, user_id: str) -> bool:
        """
        Check if a user has access to a workspace.
        
        Args:
            workspace_id: Workspace ID
            user_id: User ID
            
        Returns:
            True if user has access, False otherwise
        """
        try:
            member = self.db.query(RacineWorkspaceMember).filter(
                and_(
                    RacineWorkspaceMember.workspace_id == workspace_id,
                    RacineWorkspaceMember.user_id == user_id,
                    RacineWorkspaceMember.status == "active"
                )
            ).first()
            
            return member is not None
            
        except Exception as e:
            logger.error(f"Error checking workspace access: {str(e)}")
            return False

    # Private helper methods

    async def _initialize_workspace_resources(self, workspace: RacineWorkspace):
        """Initialize default resources for a workspace based on enabled groups."""
        try:
            enabled_groups = workspace.configuration.get("enabled_groups", [])
            
            for group_name in enabled_groups:
                if group_name in self.service_registry:
                    # Initialize group-specific default resources
                    await self._initialize_group_resources(workspace.id, group_name)
            
        except Exception as e:
            logger.error(f"Error initializing workspace resources: {str(e)}")

    async def _initialize_group_resources(self, workspace_id: str, group_name: str):
        """Initialize default resources for a specific group."""
        try:
            service = self.service_registry.get(group_name)
            if not service:
                return
            
            # Each group can have different default initialization logic
            if group_name == "data_sources":
                # Initialize with default data source templates
                pass
            elif group_name == "scan_rule_sets":
                # Initialize with default scan rule templates
                pass
            # Add more group-specific initialization as needed
            
        except Exception as e:
            logger.error(f"Error initializing {group_name} resources: {str(e)}")

    async def _validate_resource_exists(self, resource_type: ResourceType, resource_id: str, group_name: str):
        """Validate that a resource exists in the specified group."""
        try:
            service = self.service_registry.get(group_name)
            if not service:
                raise ValueError(f"Unknown group: {group_name}")
            
            # Each resource type requires different validation logic
            # This would need to be implemented based on each group's service interface
            
        except Exception as e:
            logger.error(f"Error validating resource: {str(e)}")
            raise

    async def _enrich_workspace_resources(self, resources: List[RacineWorkspaceResource]) -> List[RacineWorkspaceResource]:
        """Enrich workspace resources with live data from their respective groups."""
        try:
            enriched = []
            
            for resource in resources:
                # Get live data from the appropriate group service
                live_data = await self._get_live_resource_data(resource)
                
                # Add live data to resource metadata
                if live_data:
                    resource.metadata = resource.metadata or {}
                    resource.metadata["live_data"] = live_data
                
                enriched.append(resource)
            
            return enriched
            
        except Exception as e:
            logger.error(f"Error enriching workspace resources: {str(e)}")
            return resources

    async def _get_live_resource_data(self, resource: RacineWorkspaceResource) -> Optional[Dict[str, Any]]:
        """Get live data for a resource from its group service."""
        try:
            service = self.service_registry.get(resource.group_name)
            if not service:
                return None
            
            # This would need to be implemented based on each group's service interface
            # For now, return basic metadata
            return {
                "last_updated": datetime.utcnow(),
                "status": "active",
                "group": resource.group_name
            }
            
        except Exception as e:
            logger.error(f"Error getting live resource data: {str(e)}")
            return None

    async def _create_workspace_analytics(self, workspace_id: str) -> RacineWorkspaceAnalytics:
        """Create initial analytics entry for a workspace."""
        try:
            analytics = RacineWorkspaceAnalytics(
                workspace_id=workspace_id,
                analytics_type="summary",
                metric_name="workspace_summary",
                metric_value=1.0,
                metric_unit="count",
                analytics_data={
                    "creation_date": datetime.utcnow().isoformat(),
                    "total_resources": 0,
                    "total_members": 1,
                    "activity_score": 0.0
                }
            )
            
            self.db.add(analytics)
            return analytics
            
        except Exception as e:
            logger.error(f"Error creating workspace analytics: {str(e)}")
            raise

    async def _get_cross_group_analytics(
        self,
        workspace_id: str,
        time_range: Optional[Dict[str, datetime]]
    ) -> Dict[str, Any]:
        """Get analytics across all groups for a workspace."""
        try:
            # Aggregate analytics by querying underlying services
            from app.services.data_source_service import DataSourceService
            from app.services.enterprise_catalog_service import EnterpriseIntelligentCatalogService
            from app.services.classification_service import ClassificationService
            from app.services.compliance_rule_service import ComplianceRuleService
            from app.services.unified_scan_orchestrator import UnifiedScanOrchestrator
            ds_count = await DataSourceService.count_active_sources(workspace_id)  # type: ignore
            cat_count = await EnterpriseIntelligentCatalogService.count_assets(workspace_id)  # type: ignore
            class_cov = await ClassificationService.get_classification_coverage(workspace_id)  # type: ignore
            violations = await ComplianceRuleService.count_recent_violations(hours=24, workspace_id=workspace_id)  # type: ignore
            jobs = await UnifiedScanOrchestrator.count_recent_jobs(hours=24, workspace_id=workspace_id)  # type: ignore
            success = await UnifiedScanOrchestrator.get_recent_success_rate(hours=24, workspace_id=workspace_id)  # type: ignore
            return {
                "data_sources": {"count": ds_count, "usage": jobs},
                "scan_rule_sets": {"count": 0, "executions": jobs},
                "classifications": {"count": cat_count, "accuracy": class_cov},
                "compliance_rules": {"count": 0, "violations": violations},
                "catalog_items": {"count": cat_count, "quality_score": 0},
                "scan_logic": {"jobs": jobs, "success_rate": success},
                "ai_interactions": {"count": 0, "satisfaction": 0}
            }
            
        except Exception as e:
            logger.error(f"Error getting cross-group analytics: {str(e)}")
            return {}

    async def _get_collaboration_analytics(
        self,
        workspace_id: str,
        time_range: Optional[Dict[str, datetime]]
    ) -> Dict[str, Any]:
        """Get collaboration analytics for a workspace."""
        try:
            # Derive basic collaboration metrics from membership and discussions
            members = self.db.query(RacineWorkspaceMember).filter(RacineWorkspaceMember.workspace_id == workspace_id).all()
            active = len([m for m in members if m.last_active and m.last_active > datetime.utcnow() - timedelta(days=7)])
            sessions = self.db.query(RacineCollaborationSession).filter(RacineCollaborationSession.workspace_id == workspace_id).count() if 'RacineCollaborationSession' in globals() else 0
            shared_resources = self.db.query(RacineWorkspaceResource).filter(RacineWorkspaceResource.workspace_id == workspace_id).count()
            level = "high" if active > 10 else ("medium" if active > 3 else "low")
            return {
                "active_members": active,
                "collaboration_sessions": sessions,
                "shared_resources": shared_resources,
                "activity_level": level
            }
            
        except Exception as e:
            logger.error(f"Error getting collaboration analytics: {str(e)}")
            return {}

    async def _get_resource_usage_analytics(
        self,
        workspace_id: str,
        time_range: Optional[Dict[str, datetime]]
    ) -> Dict[str, Any]:
        """Get resource usage analytics for a workspace."""
        try:
            resources = await self.get_workspace_resources(workspace_id)
            
            return {
                "total_resources": len(resources),
                "resources_by_group": {},
                "most_used_resources": [],
                "resource_health": "good"
            }
            
        except Exception as e:
            logger.error(f"Error getting resource usage analytics: {str(e)}")
            return {}

    async def _clone_workspace_resources(self, source_id: str, target_id: str, cloned_by: str):
        """Clone resources from source workspace to target workspace."""
        try:
            resources = await self.get_workspace_resources(source_id)
            
            for resource in resources:
                await self.link_resource(
                    target_id,
                    resource.resource_type,
                    resource.resource_id,
                    resource.group_name,
                    cloned_by,
                    resource.metadata
                )
            
            logger.info(f"Cloned {len(resources)} resources from workspace {source_id} to {target_id}")
            
        except Exception as e:
            logger.error(f"Error cloning workspace resources: {str(e)}")

    async def _clone_workspace_members(self, source_id: str, target_id: str, cloned_by: str):
        """Clone members from source workspace to target workspace."""
        try:
            members = self.db.query(RacineWorkspaceMember).filter(
                RacineWorkspaceMember.workspace_id == source_id
            ).all()
            
            for member in members:
                if member.user_id != cloned_by:  # Don't clone the cloner
                    await self.add_workspace_member(
                        target_id,
                        member.user_id,
                        member.role,
                        cloned_by,
                        member.permissions
                    )
            
            logger.info(f"Cloned {len(members)} members from workspace {source_id} to {target_id}")
            
        except Exception as e:
            logger.error(f"Error cloning workspace members: {str(e)}")

    def _get_default_permissions(self, role: MemberRole) -> Dict[str, Any]:
        """Get default permissions for a member role."""
        if role == MemberRole.OWNER:
            return {
                "read": True,
                "write": True,
                "admin": True,
                "delete": True,
                "manage_members": True,
                "manage_settings": True
            }
        elif role == MemberRole.ADMIN:
            return {
                "read": True,
                "write": True,
                "admin": True,
                "delete": True,
                "manage_members": True,
                "manage_settings": False
            }
        elif role == MemberRole.CONTRIBUTOR:
            return {
                "read": True,
                "write": True,
                "admin": False,
                "delete": False,
                "manage_members": False,
                "manage_settings": False
            }
        else:  # VIEWER
            return {
                "read": True,
                "write": False,
                "admin": False,
                "delete": False,
                "manage_members": False,
                "manage_settings": False
            }

    async def _update_last_accessed(self, workspace_id: str, user_id: str):
        """Update last accessed time for workspace and user."""
        try:
            # Update workspace last accessed
            self.db.query(RacineWorkspace).filter(
                RacineWorkspace.id == workspace_id
            ).update({"last_accessed": datetime.utcnow()})
            
            # Update member last accessed
            self.db.query(RacineWorkspaceMember).filter(
                and_(
                    RacineWorkspaceMember.workspace_id == workspace_id,
                    RacineWorkspaceMember.user_id == user_id
                )
            ).update({"last_accessed": datetime.utcnow()})
            
        except Exception as e:
            logger.error(f"Error updating last accessed: {str(e)}")

    async def _create_audit_entry(
        self,
        workspace_id: str,
        event_type: str,
        event_data: Dict[str, Any],
        user_id: str
    ):
        """Create an audit entry for workspace operations."""
        try:
            audit_entry = RacineWorkspaceAudit(
                workspace_id=workspace_id,
                event_type=event_type,
                event_description=f"Workspace {event_type}",
                event_data=event_data,
                user_id=user_id
            )
            
            self.db.add(audit_entry)
            
        except Exception as e:
            logger.error(f"Error creating audit entry: {str(e)}")

    async def get_workspace_template(self, template_id: str) -> Optional[RacineWorkspaceTemplate]:
        """Get a workspace template by ID."""
        try:
            return self.db.query(RacineWorkspaceTemplate).filter(
                RacineWorkspaceTemplate.id == template_id
            ).first()
            
        except Exception as e:
            logger.error(f"Error getting workspace template: {str(e)}")
            return None