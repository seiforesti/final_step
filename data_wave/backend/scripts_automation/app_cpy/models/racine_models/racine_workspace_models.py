"""
Racine Workspace Models - Multi-Workspace Management System
===========================================================

This module contains comprehensive workspace management models for the Racine Main Manager system,
providing multi-workspace functionality with cross-group resource linking across ALL 7 data governance groups:

1. Data Sources - Workspace-scoped data source management
2. Scan Rule Sets - Workspace-specific scan rule configurations
3. Classifications - Workspace classification policies
4. Compliance Rules - Workspace compliance management
5. Advanced Catalog - Workspace catalog organization
6. Scan Logic - Workspace scan orchestration
7. RBAC System - Workspace-level access control

Features:
- Personal, team, and enterprise workspace types
- Cross-group resource management and linking
- Collaborative workspace sharing and permissions
- Template-based workspace creation and cloning
- Comprehensive workspace analytics and monitoring
- Workspace-level security and compliance controls
- Real-time collaboration and activity tracking
- Workspace settings and personalization

All models are designed for seamless integration with existing backend implementations
while providing enterprise-grade scalability, performance, and security.
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime, timedelta, timezone
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator, Field as PydanticField
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from dataclasses import dataclass

# CRITICAL: Import ALL existing models for comprehensive integration
# Data Sources Group
from ..scan_models import DataSource, ScanRuleSet, Scan, ScanResult
from ..advanced_scan_rule_models import IntelligentScanRule, RuleExecutionHistory

# Classifications Group  
from ..classification_models import ClassificationRule, ClassificationResult
from ..classification_models import ClassificationResult as DataClassification

# Compliance Rules Group
from ..compliance_models import ComplianceRequirement as ComplianceRule
# Note: ComplianceValidation is not defined
# Note: EnterpriseComplianceRule is not defined
# Note: ComplianceAuditTrail is not defined

# Advanced Catalog Group
from ..advanced_catalog_models import IntelligentDataAsset, EnterpriseDataLineage
from ..catalog_models import CatalogItem, CatalogTag
# Note: CatalogIntelligenceInsight is not defined

# Scan Logic Group
from ..scan_models import ScanOrchestrationJob
# Note: UnifiedScanExecution is not defined
from ..scan_workflow_models import ScanWorkflow
from ..workflow_models import WorkflowExecution

# RBAC System Group
from ..auth_models import User, Role, Permission, Group
from ..security_models import SecurityControl
from ..access_control_models import AccessControlResponse

# AI and Analytics Integration
from ..ai_models import AIModelConfiguration, AIInsight
# Note: MLPipeline is not defined
from ..analytics_models import AnalyticsInsight
from ..performance_models import PerformanceMetric

# Workflow and Task Management
from ..workflow_models import Workflow, WorkflowExecution
from ..task_models import ScheduledTask, TaskExecution

# Integration and Performance
from ..integration_models import Integration
from ..performance_models import PerformanceMetric

# ===================== ENUMS AND CONSTANTS =====================

class WorkspaceType(str, Enum):
    """Types of workspaces"""
    PERSONAL = "personal"
    TEAM = "team"
    ENTERPRISE = "enterprise"
    SHARED = "shared"
    TEMPLATE = "template"

class WorkspaceStatus(str, Enum):
    """Workspace status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"
    MAINTENANCE = "maintenance"

class WorkspaceAccessLevel(str, Enum):
    """Workspace access levels"""
    PRIVATE = "private"
    SHARED = "shared"
    PUBLIC = "public"
    RESTRICTED = "restricted"

class WorkspaceMemberRole(str, Enum):
    """Workspace member roles"""
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"
    CONTRIBUTOR = "contributor"

class ResourceAccessLevel(str, Enum):
    """Resource access levels within workspace"""
    FULL = "full"
    READ_WRITE = "read_write"
    READ_ONLY = "read_only"
    RESTRICTED = "restricted"
    DENIED = "denied"

class WorkspaceNotificationType(str, Enum):
    """Types of workspace notifications"""
    MEMBER_ADDED = "member_added"
    MEMBER_REMOVED = "member_removed"
    RESOURCE_SHARED = "resource_shared"
    ACTIVITY_ALERT = "activity_alert"
    SYSTEM_UPDATE = "system_update"
    SECURITY_ALERT = "security_alert"

# ===================== CORE WORKSPACE MODELS =====================

class RacineWorkspace(SQLModel, table=True):
    """
    Master workspace container for cross-group resource management.
    
    Provides a unified workspace environment where users can organize,
    manage, and collaborate on resources from all 7 data governance groups.
    Supports personal, team, and enterprise workspace types with comprehensive
    access control, analytics, and collaboration features.
    
    Integration Points:
    - Links to resources from ALL 7 groups
    - Deep RBAC integration for workspace-level access control
    - Activity tracking for all workspace operations
    - Analytics integration for usage monitoring
    - Template system for quick workspace creation
    """
    __tablename__ = "racine_workspace"

    # Primary identification
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="Unique identifier for workspace"
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        index=True,
        description="Human-readable workspace name"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Detailed workspace description and purpose"
    )
    
    # Workspace configuration
    workspace_type: WorkspaceType = Field(
        default=WorkspaceType.PERSONAL,
        index=True,
        description="Type of workspace: personal, team, enterprise, shared, template"
    )
    status: WorkspaceStatus = Field(
        default=WorkspaceStatus.ACTIVE,
        index=True,
        description="Current workspace status"
    )
    access_level: WorkspaceAccessLevel = Field(
        default=WorkspaceAccessLevel.PRIVATE,
        index=True,
        description="Workspace access level: private, shared, public, restricted"
    )
    
    # Ownership and access control
    owner_id: int = Field(
        ...,
        foreign_key="users.id",
        index=True,
        description="Primary owner of the workspace"
    )
    is_public: bool = Field(
        default=False,
        index=True,
        description="Whether workspace is publicly accessible"
    )
    is_template: bool = Field(
        default=False,
        index=True,
        description="Whether this workspace serves as a template"
    )
    
    # CRITICAL: Cross-group resource integration
    connected_data_sources: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="IDs of connected data sources from data sources group"
    )
    linked_scan_rule_sets: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="IDs of linked scan rule sets from scan rule sets group"
    )
    associated_classifications: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="IDs of associated classifications from classifications group"
    )
    compliance_policies: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="IDs of compliance policies from compliance rules group"
    )
    catalog_items: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="IDs of catalog items from advanced catalog group"
    )
    scan_logic_configurations: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="IDs of scan logic configurations from scan logic group"
    )
    rbac_configurations: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="IDs of RBAC configurations from RBAC system group"
    )
    
    # Cross-group integration settings
    group_permissions: Dict[str, Dict[str, Any]] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Permissions for each group within workspace"
    )
    resource_mappings: Dict[str, Dict[str, Any]] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Mappings between resources across groups"
    )
    integration_settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Cross-group integration configuration"
    )
    
    # Workspace settings and configuration
    workspace_settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Workspace-specific settings and preferences"
    )
    layout_preferences: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="User interface layout preferences"
    )
    theme_settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Theme and appearance settings"
    )
    notification_settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Notification preferences and configuration"
    )
    
    # Analytics and monitoring
    usage_analytics: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Workspace usage analytics and metrics"
    )
    performance_metrics: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Performance metrics and optimization data"
    )
    collaboration_metrics: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Collaboration activity and engagement metrics"
    )
    cost_tracking: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Cost tracking and resource usage billing"
    )
    
    # Security and compliance
    security_settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Workspace security configuration"
    )
    audit_settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Audit trail configuration"
    )
    backup_settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Backup and recovery configuration"
    )
    retention_policy: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Data retention and lifecycle policies"
    )
    
    # Template information (if workspace is a template)
    template_category: Optional[str] = Field(
        default=None,
        index=True,
        description="Template category for organization"
    )
    template_tags: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="Tags for template discovery and categorization"
    )
    template_usage_count: int = Field(
        default=0,
        description="Number of times template has been used"
    )
    template_rating: float = Field(
        default=0.0,
        description="Average rating for template (0-5)"
    )
    
    # Workspace limits and quotas
    resource_limits: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Resource limits and quotas for workspace"
    )
    storage_quota_gb: Optional[float] = Field(
        default=None,
        description="Storage quota in gigabytes"
    )
    member_limit: Optional[int] = Field(
        default=None,
        description="Maximum number of workspace members"
    )
    
    # Metadata and lifecycle
    tags: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="Tags for categorization and search"
    )
    workspace_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Additional metadata and custom properties"
    )
    
    # Audit fields
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Last update timestamp"
    )
    last_accessed: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Last access timestamp"
    )
    archived_at: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Archive timestamp if workspace is archived"
    )
    
    # Relationships
    owner: "User" = Relationship(
        back_populates="owned_workspaces",
        sa_relationship_kwargs={"foreign_keys": "[RacineWorkspace.owner_id]"}
    )
    members: List["RacineWorkspaceMember"] = Relationship(
        back_populates="workspace"
    )
    resources: List["RacineWorkspaceResource"] = Relationship(
        back_populates="workspace"
    )
    analytics_records: List["RacineWorkspaceAnalytics"] = Relationship(
        back_populates="workspace"
    )
    audit_records: List["RacineWorkspaceAudit"] = Relationship(
        back_populates="workspace"
    )
    notifications: List["RacineWorkspaceNotification"] = Relationship(
        back_populates="workspace"
    )

    # Database constraints and indexes
    __table_args__ = (
        Index("idx_workspace_owner_type", "owner_id", "workspace_type"),
        Index("idx_workspace_status_access", "status", "access_level"),
        Index("idx_workspace_public_template", "is_public", "is_template"),
        Index("idx_workspace_created_updated", "created_at", "updated_at"),
        Index("idx_workspace_template_category", "template_category"),
        CheckConstraint("template_rating >= 0 AND template_rating <= 5", name="check_template_rating_range"),
        CheckConstraint("template_usage_count >= 0", name="check_template_usage_count_positive"),
        CheckConstraint("storage_quota_gb IS NULL OR storage_quota_gb > 0", name="check_storage_quota_positive"),
        CheckConstraint("member_limit IS NULL OR member_limit > 0", name="check_member_limit_positive"),
        UniqueConstraint("name", "owner_id", name="unique_workspace_name_per_owner")
    )

class RacineWorkspaceMember(SQLModel, table=True):
    """
    Workspace membership management with role-based access control.
    
    Manages user membership in workspaces with sophisticated role-based
    access control that integrates with the existing RBAC system.
    Supports different membership roles and fine-grained permissions.
    """
    __tablename__ = "racine_workspace_member"

    # Primary identification
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="Unique identifier for workspace membership"
    )
    workspace_id: str = Field(
        foreign_key="racine_workspace.id",
        index=True,
        description="Reference to workspace"
    )
    user_id: int = Field(
        foreign_key="users.id",
        index=True,
        description="Reference to user"
    )
    
    # Role and permissions - INTEGRATES WITH EXISTING RBAC
    role: WorkspaceMemberRole = Field(
        default=WorkspaceMemberRole.MEMBER,
        index=True,
        description="Member role within workspace"
    )
    permissions: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Specific permissions within workspace"
    )
    group_access: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Access permissions for specific groups within workspace"
    )
    resource_permissions: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Permissions for specific resources within workspace"
    )
    
    # Membership status and settings
    status: str = Field(
        default="active",
        index=True,
        description="Membership status: active, suspended, pending, expired"
    )
    invitation_status: str = Field(
        default="accepted",
        index=True,
        description="Invitation status: pending, accepted, declined, expired"
    )
    invitation_token: Optional[str] = Field(
        default=None,
        index=True,
        description="Invitation token for pending invitations"
    )
    invitation_expires_at: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Invitation expiration timestamp"
    )
    
    # Activity tracking
    joined_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Timestamp when user joined workspace"
    )
    last_active: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Last activity timestamp in workspace"
    )
    activity_count: int = Field(
        default=0,
        description="Total number of activities performed in workspace"
    )
    last_login: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Last login timestamp to workspace"
    )
    
    # Collaboration preferences
    collaboration_settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Collaboration preferences and settings"
    )
    notification_preferences: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Notification preferences for workspace activities"
    )
    
    # Access restrictions and security
    access_restrictions: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Access restrictions and security constraints"
    )
    ip_restrictions: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="IP address restrictions for member access"
    )
    time_restrictions: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Time-based access restrictions"
    )
    
    # Invitation and management
    invited_by: Optional[int] = Field(
        default=None,
        foreign_key="users.id",
        index=True,
        description="User who invited this member"
    )
    invitation_message: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Personal message included with invitation"
    )
    
    # Audit fields
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Last update timestamp"
    )
    
    # Relationships
    workspace: "RacineWorkspace" = Relationship(
        back_populates="members"
    )
    user: "User" = Relationship(
        back_populates="workspace_memberships",
        sa_relationship_kwargs={"foreign_keys": "[RacineWorkspaceMember.user_id]"}
    )
    inviter: Optional["User"] = Relationship(
        back_populates="sent_workspace_invitations",
        sa_relationship_kwargs={"foreign_keys": "[RacineWorkspaceMember.invited_by]"}
    )

    # Database constraints and indexes
    __table_args__ = (
        Index("idx_workspace_member_workspace_user", "workspace_id", "user_id"),
        Index("idx_workspace_member_role_status", "role", "status"),
        Index("idx_workspace_member_joined_active", "joined_at", "last_active"),
        Index("idx_workspace_member_invitation", "invitation_status", "invitation_expires_at"),
        CheckConstraint("activity_count >= 0", name="check_activity_count_positive"),
        UniqueConstraint("workspace_id", "user_id", name="unique_workspace_membership")
    )

class RacineWorkspaceResource(SQLModel, table=True):
    """
    Cross-group resource management within workspaces.
    
    Links and manages resources from all 7 data governance groups
    within workspace contexts, providing unified resource access,
    sharing, and collaboration capabilities.
    """
    __tablename__ = "racine_workspace_resource"

    # Primary identification
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="Unique identifier for workspace resource"
    )
    workspace_id: str = Field(
        foreign_key="racine_workspace.id",
        index=True,
        description="Reference to workspace"
    )
    
    # CRITICAL: Resource identification - LINKS TO ALL EXISTING RESOURCES
    resource_type: str = Field(
        ...,
        index=True,
        description="Type of resource: data_source, scan_rule, classification, compliance_rule, catalog_item, scan_job, user, role"
    )
    resource_id: str = Field(
        ...,
        index=True,
        description="ID of the actual resource in its native group"
    )
    group_id: str = Field(
        ...,
        index=True,
        description="Group that owns this resource: data_sources, scan_rule_sets, classifications, etc."
    )
    
    # Resource metadata and display information
    resource_name: Optional[str] = Field(
        default=None,
        max_length=255,
        index=True,
        description="Display name for resource within workspace"
    )
    resource_description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Description of resource within workspace context"
    )
    resource_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Cached metadata from the original resource"
    )
    
    # Access and sharing configuration
    access_level: ResourceAccessLevel = Field(
        default=ResourceAccessLevel.READ_WRITE,
        index=True,
        description="Access level for this resource within workspace"
    )
    is_shared: bool = Field(
        default=False,
        index=True,
        description="Whether resource is shared with workspace members"
    )
    shared_with: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="List of user IDs with whom resource is specifically shared"
    )
    sharing_permissions: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Detailed sharing permissions and restrictions"
    )
    
    # Resource organization within workspace
    folder_path: Optional[str] = Field(
        default=None,
        index=True,
        description="Folder path for organizing resources within workspace"
    )
    tags: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="Tags for resource organization and search"
    )
    category: Optional[str] = Field(
        default=None,
        index=True,
        description="Category for resource organization"
    )
    priority: int = Field(
        default=0,
        description="Priority for resource ordering and display"
    )
    
    # Usage tracking and analytics
    usage_count: int = Field(
        default=0,
        description="Number of times resource has been accessed"
    )
    last_accessed: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Last access timestamp"
    )
    last_accessed_by: Optional[int] = Field(
        default=None,
        foreign_key="users.id",
        description="User who last accessed this resource"
    )
    access_history: List[Dict[str, Any]] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="History of resource access and modifications"
    )
    
    # Resource dependencies and relationships
    depends_on: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="List of resource IDs this resource depends on"
    )
    dependents: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="List of resource IDs that depend on this resource"
    )
    related_resources: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="List of related resource IDs"
    )
    
    # Resource status and lifecycle
    status: str = Field(
        default="active",
        index=True,
        description="Resource status within workspace: active, inactive, archived, error"
    )
    sync_status: str = Field(
        default="synced",
        index=True,
        description="Synchronization status with original resource: synced, pending, error"
    )
    last_sync: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Last synchronization timestamp with original resource"
    )
    
    # Resource configuration within workspace
    workspace_config: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Workspace-specific configuration for this resource"
    )
    display_settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Display settings for resource within workspace"
    )
    
    # Collaboration and comments
    comments: List[Dict[str, Any]] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="Comments and discussions about this resource"
    )
    annotations: List[Dict[str, Any]] = Field(
        default_factory=list,
        sa_column=Column(JSONB),
        description="Annotations and notes for this resource"
    )
    
    # Resource linking and management
    added_by: int = Field(
        ...,
        foreign_key="users.id",
        index=True,
        description="User who added this resource to workspace"
    )
    added_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Timestamp when resource was added to workspace"
    )
    
    # Audit fields
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Last update timestamp"
    )
    
    # Relationships
    workspace: "RacineWorkspace" = Relationship(
        back_populates="resources"
    )
    added_by_user: "User" = Relationship(
        back_populates="added_workspace_resources",
        sa_relationship_kwargs={"foreign_keys": "[RacineWorkspaceResource.added_by]"}
    )
    last_accessed_by_user: Optional["User"] = Relationship(
        back_populates="last_accessed_workspace_resources",
        sa_relationship_kwargs={"foreign_keys": "[RacineWorkspaceResource.last_accessed_by]"}
    )

    # Database constraints and indexes
    __table_args__ = (
        Index("idx_workspace_resource_workspace_type", "workspace_id", "resource_type"),
        Index("idx_workspace_resource_group_id", "group_id", "resource_id"),
        Index("idx_workspace_resource_access_level", "access_level", "is_shared"),
        Index("idx_workspace_resource_status_sync", "status", "sync_status"),
        Index("idx_workspace_resource_folder_category", "folder_path", "category"),
        Index("idx_workspace_resource_added", "added_by", "added_at"),
        CheckConstraint("usage_count >= 0", name="check_usage_count_positive"),
        CheckConstraint("priority >= 0", name="check_priority_positive"),
        UniqueConstraint("workspace_id", "resource_type", "resource_id", name="unique_workspace_resource")
    )

# ===================== SUPPORTING WORKSPACE MODELS =====================

class RacineWorkspaceTemplate(SQLModel, table=True):
    """Workspace template management for quick workspace creation."""
    __tablename__ = "racine_workspace_template"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(..., max_length=255, index=True)
    description: Optional[str] = Field(default=None, max_length=2000)
    category: Optional[str] = Field(default=None, index=True)
    
    # Template configuration - INCLUDES ALL GROUP CONFIGURATIONS
    template_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    default_integrations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    default_resources: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB))
    default_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    
    # Template metadata
    is_public: bool = Field(default=False, index=True)
    usage_count: int = Field(default=0)
    average_rating: float = Field(default=0.0)
    total_ratings: int = Field(default=0)
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSONB))
    
    # Template management
    version: str = Field(default="1.0.0")
    is_verified: bool = Field(default=False, index=True)
    created_by: int = Field(..., foreign_key="users.id", index=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)

class RacineWorkspaceAnalytics(SQLModel, table=True):
    """Comprehensive workspace analytics and usage tracking."""
    __tablename__ = "racine_workspace_analytics"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    workspace_id: str = Field(foreign_key="racine_workspace.id", index=True)
    analytics_date: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Usage metrics
    active_users: int = Field(default=0)
    total_activities: int = Field(default=0)
    resource_access_count: int = Field(default=0)
    collaboration_events: int = Field(default=0)
    
    # Performance metrics
    average_response_time: float = Field(default=0.0)
    error_rate: float = Field(default=0.0)
    uptime_percentage: float = Field(default=100.0)
    
    # Resource utilization
    storage_used_gb: float = Field(default=0.0)
    bandwidth_used_gb: float = Field(default=0.0)
    compute_hours: float = Field(default=0.0)
    
    # Detailed analytics
    user_activity_breakdown: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    resource_usage_breakdown: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    group_activity_breakdown: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    
    workspace: "RacineWorkspace" = Relationship(back_populates="analytics_records")

class RacineWorkspaceSettings(SQLModel, table=True):
    """Workspace settings and configuration management."""
    __tablename__ = "racine_workspace_settings"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    workspace_id: str = Field(foreign_key="racine_workspace.id", index=True)
    setting_category: str = Field(..., index=True)
    setting_key: str = Field(..., index=True)
    setting_value: Dict[str, Any] = Field(..., sa_column=Column(JSONB))
    setting_type: str = Field(...)  # string, number, boolean, object, array
    is_user_configurable: bool = Field(default=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)

class RacineWorkspaceAudit(SQLModel, table=True):
    """Comprehensive workspace audit trail."""
    __tablename__ = "racine_workspace_audit"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    workspace_id: str = Field(foreign_key="racine_workspace.id", index=True)
    action: str = Field(..., index=True)
    performed_by: int = Field(..., foreign_key="users.id", index=True)
    target_type: Optional[str] = Field(default=None, index=True)
    target_id: Optional[str] = Field(default=None, index=True)
    details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    ip_address: Optional[str] = Field(default=None)
    user_agent: Optional[str] = Field(default=None)
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    workspace: "RacineWorkspace" = Relationship(back_populates="audit_records")

class RacineWorkspaceNotification(SQLModel, table=True):
    """Workspace notification management."""
    __tablename__ = "racine_workspace_notification"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    workspace_id: str = Field(foreign_key="racine_workspace.id", index=True)
    notification_type: WorkspaceNotificationType = Field(..., index=True)
    title: str = Field(..., max_length=255)
    message: str = Field(..., max_length=2000)
    recipient_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    is_broadcast: bool = Field(default=False, index=True)
    priority: str = Field(default="medium", index=True)  # low, medium, high, urgent
    
    # Notification status
    is_read: bool = Field(default=False, index=True)
    read_at: Optional[datetime] = Field(default=None, index=True)
    is_dismissed: bool = Field(default=False, index=True)
    dismissed_at: Optional[datetime] = Field(default=None, index=True)
    
    # Notification data
    data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    action_url: Optional[str] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None, index=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    workspace: "RacineWorkspace" = Relationship(back_populates="notifications")