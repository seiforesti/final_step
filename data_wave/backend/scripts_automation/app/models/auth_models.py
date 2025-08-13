
from __future__ import annotations
from sqlmodel import SQLModel, Field
from typing import Optional, List, ClassVar, Any
from datetime import datetime
from sqlalchemy.orm import relationship

class RoleInheritance(SQLModel, table=True):
    __tablename__ = "role_inheritance"
    id: Optional[int] = Field(default=None, primary_key=True)
    parent_role_id: int = Field(foreign_key="roles.id")
    child_role_id: int = Field(foreign_key="roles.id")

# Move UserGroup above User and Group so it can be referenced
class UserGroup(SQLModel, table=True):
    __tablename__ = "user_groups"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    group_id: int = Field(foreign_key="groups.id")


class UserRole(SQLModel, table=True):
    __tablename__ = "user_roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    role_id: int = Field(foreign_key="roles.id")

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False, unique=True)
    hashed_password: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    mfa_enabled: bool = Field(default=False)
    mfa_secret: Optional[str] = Field(default=None)
    role: str = Field(default="user", nullable=False)  # NEW: user, admin, steward, etc.
    
    # Enhanced profile fields
    first_name: Optional[str] = Field(default=None)
    last_name: Optional[str] = Field(default=None)
    display_name: Optional[str] = Field(default=None)
    profile_picture_url: Optional[str] = Field(default=None)
    birthday: Optional[str] = Field(default=None)  # Store as ISO date string
    phone_number: Optional[str] = Field(default=None)
    department: Optional[str] = Field(default=None)
    region: Optional[str] = Field(default=None)
    oauth_provider: Optional[str] = Field(default=None)  # google, microsoft, email
    oauth_id: Optional[str] = Field(default=None)  # OAuth provider user ID
    last_login: Optional[datetime] = Field(default=None)
    timezone: Optional[str] = Field(default=None)

    # sessions: List["Session"] = relationship(back_populates="user")
    # roles: List[Role] = relationship(back_populates="users", link_model=UserRole)
    # groups: List[Group] = relationship(back_populates="users", link_model=UserGroup)
    sessions: ClassVar[Any] = relationship("Session", back_populates="user")
    roles: ClassVar[Any] = relationship(
        "Role",
        secondary="user_roles",
        back_populates="users",
        lazy="selectin"
    )
    groups: ClassVar[Any] = relationship("Group", secondary="user_groups", back_populates="users")
    
    # RACINE ORCHESTRATION RELATIONSHIPS - Added for integration with Racine Main Manager
    created_orchestrations: ClassVar[Any] = relationship(
        "RacineOrchestrationMaster",
        foreign_keys="[RacineOrchestrationMaster.created_by]",
        back_populates="creator"
    )
    modified_orchestrations: ClassVar[Any] = relationship(
        "RacineOrchestrationMaster", 
        foreign_keys="[RacineOrchestrationMaster.last_modified_by]",
        back_populates="modifier"
    )
    triggered_workflow_executions: ClassVar[Any] = relationship(
        "RacineWorkflowExecution",
        foreign_keys="[RacineWorkflowExecution.triggered_by]",
        back_populates="triggered_by_user"
    )
    created_integrations: ClassVar[Any] = relationship(
        "RacineCrossGroupIntegration",
        foreign_keys="[RacineCrossGroupIntegration.created_by]",
        back_populates="creator"
    )
    
    # RACINE WORKSPACE RELATIONSHIPS - Added for workspace management integration
    owned_workspaces: ClassVar[Any] = relationship(
        "RacineWorkspace",
        foreign_keys="[RacineWorkspace.owner_id]",
        back_populates="owner"
    )
    workspace_memberships: ClassVar[Any] = relationship(
        "RacineWorkspaceMember",
        foreign_keys="[RacineWorkspaceMember.user_id]",
        back_populates="user"
    )
    sent_workspace_invitations: ClassVar[Any] = relationship(
        "RacineWorkspaceMember",
        foreign_keys="[RacineWorkspaceMember.invited_by]",
        back_populates="inviter"
    )
    added_workspace_resources: ClassVar[Any] = relationship(
        "RacineWorkspaceResource",
        foreign_keys="[RacineWorkspaceResource.added_by]",
        back_populates="added_by_user"
    )
    last_accessed_workspace_resources: ClassVar[Any] = relationship(
        "RacineWorkspaceResource",
        foreign_keys="[RacineWorkspaceResource.last_accessed_by]",
        back_populates="last_accessed_by_user"
    )

# --- Group and Deny Assignment Models ---

class Group(SQLModel, table=True):
    __tablename__ = "groups"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False, unique=True)
    description: Optional[str] = Field(default=None)
    # users: List[User] = relationship(back_populates="groups", link_model=UserGroup)
    users: ClassVar[Any] = relationship("User", secondary="user_groups", back_populates="groups")


class GroupRole(SQLModel, table=True):
    __tablename__ = "group_roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="groups.id")
    role_id: int = Field(foreign_key="roles.id")
    resource_type: Optional[str] = Field(default=None)
    resource_id: Optional[str] = Field(default=None)
    assigned_at: datetime = Field(default_factory=datetime.utcnow)

class DenyAssignment(SQLModel, table=True):
    __tablename__ = "deny_assignments"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(foreign_key="users.id", default=None)
    group_id: Optional[int] = Field(foreign_key="groups.id", default=None)
    action: str = Field(nullable=False)
    resource: str = Field(nullable=False)
    conditions: Optional[str] = Field(default=None)  # JSON string for ABAC/row-level
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Session(SQLModel, table=True):
    __tablename__ = "sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    session_token: str = Field(index=True, nullable=False, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

    # user: Optional[User] = relationship(back_populates="sessions")
    user: ClassVar[Any] = relationship("User", back_populates="sessions")
class EmailVerificationCode(SQLModel, table=True):
    __tablename__ = "email_verification_codes"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False)
    code: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

class RolePermission(SQLModel, table=True):
    __tablename__ = "role_permissions"
    id: Optional[int] = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="roles.id")
    permission_id: int = Field(foreign_key="permissions.id")

class Permission(SQLModel, table=True):
    __tablename__ = "permissions"
    id: Optional[int] = Field(default=None, primary_key=True)
    action: str = Field(nullable=False, index=True)  # e.g., 'view', 'edit', 'delete'
    resource: str = Field(nullable=False, index=True)  # e.g., 'sensitivity_labels'
    conditions: Optional[str] = Field(default=None)  # JSON string for row-level security
    # roles: List["Role"] = relationship(back_populates="permissions", link_model=RolePermission)
    roles: ClassVar[Any] = relationship(
        "Role",
        secondary="role_permissions",
        back_populates="permissions",
        lazy="selectin"
    )

class Role(SQLModel, table=True):
    __tablename__ = "roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False, unique=True)
    description: Optional[str] = Field(default=None)

    # users: List["User"] = relationship(back_populates="roles", link_model=UserRole)
    # permissions: List["Permission"] = relationship(back_populates="roles", link_model=RolePermission)
    users: ClassVar[Any] = relationship("User", secondary="user_roles", back_populates="roles")
    permissions: ClassVar[Any] = relationship(
        "Permission",
        secondary="role_permissions",
        back_populates="roles",
        lazy="selectin"
    )
    # Role inheritance: parents and children
    parents: ClassVar[Any] = relationship(
        "Role",
        secondary="role_inheritance",
        primaryjoin="Role.id==role_inheritance.c.child_role_id",
        secondaryjoin="Role.id==role_inheritance.c.parent_role_id",
        back_populates="children",
        lazy="selectin"
    )
    children: ClassVar[Any] = relationship(
        "Role",
        secondary="role_inheritance",
        primaryjoin="Role.id==role_inheritance.c.parent_role_id",
        secondaryjoin="Role.id==role_inheritance.c.child_role_id",
        back_populates="parents",
        lazy="selectin"
    )
# --- Advanced RBAC Models ---


# --- Hierarchical Resource Model ---
class Resource(SQLModel, table=True):
    __tablename__ = "resources"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, index=True)
    type: str = Field(nullable=False, index=True)  # server, database, schema, table, collection
    parent_id: Optional[int] = Field(default=None, foreign_key="resources.id")
    engine: Optional[str] = Field(default=None)  # mysql, postgres, mongo (for server)
    details: Optional[str] = Field(default=None)  # JSON: connection info, etc.
    # Relationships
    parent: ClassVar[Any] = relationship("Resource", remote_side="Resource.id", back_populates="children")
    children: ClassVar[Any] = relationship("Resource", back_populates="parent")

# Resource-level scoped role assignment (now references Resource.id)
class ResourceRole(SQLModel, table=True):
    __tablename__ = "resource_roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    role_id: int = Field(foreign_key="roles.id")
    resource_type: str = Field(nullable=False)
    resource_id: int = Field(foreign_key="resources.id")
    assigned_at: datetime = Field(default_factory=datetime.utcnow)

# Delegated access request (for access review/delegation workflows)
class AccessRequest(SQLModel, table=True):
    __tablename__ = "access_requests"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    resource_type: str = Field(nullable=False)
    resource_id: str = Field(nullable=False)
    requested_role: str = Field(nullable=False)
    justification: str = Field(nullable=False)
    status: str = Field(default="pending")  # pending, approved, rejected
    review_note: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_by: Optional[str] = Field(default=None)
    reviewed_at: Optional[datetime] = Field(default=None)

# RBAC Audit Log (for detailed audit logging)
class RbacAuditLog(SQLModel, table=True):
    __tablename__ = "rbac_audit_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    action: str = Field(nullable=False)  # e.g., 'assign_role', 'revoke_role', 'request_access', etc.
    performed_by: str = Field(nullable=False)
    # Legacy fields for compatibility
    target_user: Optional[str] = Field(default=None)
    resource_type: Optional[str] = Field(default=None)
    resource_id: Optional[str] = Field(default=None)
    role: Optional[str] = Field(default=None)
    status: Optional[str] = Field(default=None)
    note: Optional[str] = Field(default=None)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # --- Advanced RBAC Audit Fields ---
    entity_type: Optional[str] = Field(default=None, index=True, description="Type of entity affected (user, role, group, permission, resource, etc.)")
    entity_id: Optional[str] = Field(default=None, index=True, description="ID of the entity affected")
    before_state: Optional[str] = Field(default=None, description="JSON: state before action")
    after_state: Optional[str] = Field(default=None, description="JSON: state after action")
    correlation_id: Optional[str] = Field(default=None, index=True, description="Correlation ID for workflow chains")
    actor_ip: Optional[str] = Field(default=None, description="IP address of actor")
    actor_device: Optional[str] = Field(default=None, description="Device info of actor")
    api_client: Optional[str] = Field(default=None, description="API client info")
    extra_metadata: Optional[str] = Field(default=None, description="JSON: any extra metadata/context")

# --- Condition Template Model ---
class ConditionTemplate(SQLModel, table=True):
    __tablename__ = "condition_templates"
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str = Field(nullable=False, unique=True, index=True, description="Display name for the template")
    value: str = Field(nullable=False, description="JSON string representing the condition template")
    description: Optional[str] = Field(default=None, description="Optional description or guidance for admins")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
