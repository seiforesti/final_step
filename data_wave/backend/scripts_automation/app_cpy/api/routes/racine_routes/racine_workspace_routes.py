"""
Racine Workspace Management API Routes
=====================================

This module provides comprehensive workspace management API endpoints for the Racine Main Manager,
enabling multi-workspace management with cross-group resource integration.

Features:
- Multi-workspace CRUD operations
- Cross-group resource linking and management
- Workspace templates and cloning
- Team collaboration and access control
- Workspace analytics and monitoring
- Integration with all 7 groups for unified workspace experience
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
import uuid
import json

# Pydantic models for request/response
from pydantic import BaseModel, Field
from enum import Enum

# Database and dependencies
from ....core.database import get_db
from ...security.rbac import get_current_user, require_permissions
from ....models.auth_models import User

# Import racine services
from ....services.racine_services.racine_workspace_service import RacineWorkspaceService
from ....services.racine_services.racine_orchestration_service import RacineOrchestrationService

# Import models for type hints
from ....models.racine_models.racine_workspace_models import (
    RacineWorkspace, RacineWorkspaceMember, RacineWorkspaceResource,
    RacineWorkspaceTemplate, RacineWorkspaceAnalytics
)

router = APIRouter(prefix="/api/racine/workspace", tags=["racine-workspace"])

# =====================================================================================
# Pydantic Models for Request/Response
# =====================================================================================

class WorkspaceType(str, Enum):
    PERSONAL = "personal"
    TEAM = "team"
    ENTERPRISE = "enterprise"
    PROJECT = "project"

class WorkspaceStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"

class ResourceType(str, Enum):
    DATA_SOURCE = "data_source"
    SCAN_RULE_SET = "scan_rule_set"
    CLASSIFICATION = "classification"
    COMPLIANCE_RULE = "compliance_rule"
    CATALOG_ITEM = "catalog_item"
    SCAN_JOB = "scan_job"
    WORKFLOW = "workflow"
    PIPELINE = "pipeline"

class WorkspaceCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    workspace_type: WorkspaceType = WorkspaceType.TEAM
    template_id: Optional[str] = None
    configuration: Dict[str, Any] = Field(default_factory=dict)
    access_control: Dict[str, Any] = Field(default_factory=dict)
    groups: List[str] = Field(default_factory=list)
    members: List[Dict[str, Any]] = Field(default_factory=list)

class WorkspaceUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    configuration: Optional[Dict[str, Any]] = None
    access_control: Optional[Dict[str, Any]] = None
    status: Optional[WorkspaceStatus] = None

class WorkspaceMemberRequest(BaseModel):
    user_id: str
    role: str = Field(..., regex="^(owner|admin|editor|viewer)$")
    permissions: Dict[str, Any] = Field(default_factory=dict)

class ResourceLinkRequest(BaseModel):
    resource_type: ResourceType
    resource_id: str
    group_name: str
    link_configuration: Dict[str, Any] = Field(default_factory=dict)
    access_permissions: Dict[str, Any] = Field(default_factory=dict)

class WorkspaceTemplateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    template_configuration: Dict[str, Any]
    default_groups: List[str] = Field(default_factory=list)
    default_resources: List[Dict[str, Any]] = Field(default_factory=list)
    access_control_template: Dict[str, Any] = Field(default_factory=dict)

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    workspace_type: str
    status: str
    configuration: Dict[str, Any]
    access_control: Dict[str, Any]
    groups: List[str]
    member_count: int
    resource_count: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    owner_id: str

class WorkspaceMemberResponse(BaseModel):
    id: str
    user_id: str
    role: str
    permissions: Dict[str, Any]
    joined_at: datetime
    last_active: Optional[datetime]
    status: str

class WorkspaceResourceResponse(BaseModel):
    id: str
    resource_type: str
    resource_id: str
    group_name: str
    resource_name: str
    link_configuration: Dict[str, Any]
    access_permissions: Dict[str, Any]
    linked_at: datetime
    linked_by: str
    status: str

class WorkspaceAnalyticsResponse(BaseModel):
    workspace_id: str
    time_range: str
    generated_at: datetime
    usage_metrics: Dict[str, Any]
    collaboration_metrics: Dict[str, Any]
    resource_metrics: Dict[str, Any]
    performance_metrics: Dict[str, Any]

# =====================================================================================
# Workspace Management Endpoints
# =====================================================================================

@router.post("/create", response_model=WorkspaceResponse)
async def create_workspace(
    request: WorkspaceCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new workspace with cross-group integration
    
    This endpoint creates a new workspace that can integrate resources
    from all 7 groups with proper access control and collaboration features.
    """
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Create workspace configuration
        from ....services.racine_services.racine_workspace_service import WorkspaceConfiguration
        
        config = WorkspaceConfiguration(
            name=request.name,
            description=request.description or "",
            workspace_type=request.workspace_type.value,
            template_id=request.template_id,
            configuration=request.configuration,
            access_control=request.access_control,
            groups=request.groups,
            initial_members=request.members
        )
        
        # Create workspace
        workspace = await workspace_service.create_workspace(
            config=config,
            creator_id=current_user.id
        )
        
        # Schedule background initialization
        background_tasks.add_task(
            _initialize_workspace_resources,
            workspace.id,
            request.groups,
            current_user.id,
            db
        )
        
        # Get workspace with additional data
        workspace_data = await workspace_service.get_workspace_details(
            workspace.id,
            current_user.id
        )
        
        return WorkspaceResponse(**workspace_data)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed workspace information including members and resources"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify access
        if not await workspace_service.verify_workspace_access(workspace_id, current_user.id):
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        workspace_data = await workspace_service.get_workspace_details(
            workspace_id,
            current_user.id
        )
        
        return WorkspaceResponse(**workspace_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    request: WorkspaceUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update workspace configuration and settings"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify permissions
        if not await workspace_service.verify_workspace_permissions(
            workspace_id, current_user.id, ["admin", "owner"]
        ):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Prepare update data
        update_data = {k: v for k, v in request.model_dump().items() if v is not None}
        
        # Update workspace
        workspace = await workspace_service.update_workspace(
            workspace_id,
            update_data,
            current_user.id
        )
        
        # Get updated workspace data
        workspace_data = await workspace_service.get_workspace_details(
            workspace_id,
            current_user.id
        )
        
        return WorkspaceResponse(**workspace_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{workspace_id}")
async def delete_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete workspace and all associated data"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify ownership
        if not await workspace_service.verify_workspace_permissions(
            workspace_id, current_user.id, ["owner"]
        ):
            raise HTTPException(status_code=403, detail="Only workspace owner can delete")
        
        # Delete workspace
        success = await workspace_service.delete_workspace(
            workspace_id,
            current_user.id
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to delete workspace")
        
        return {"message": "Workspace deleted successfully", "workspace_id": workspace_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[WorkspaceResponse])
async def list_user_workspaces(
    status: Optional[WorkspaceStatus] = Query(None),
    workspace_type: Optional[WorkspaceType] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all workspaces accessible to the current user"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Build filters
        filters = {}
        if status:
            filters['status'] = status.value
        if workspace_type:
            filters['workspace_type'] = workspace_type.value
        
        # Get user workspaces
        workspaces = await workspace_service.get_user_workspaces(
            user_id=current_user.id,
            filters=filters,
            limit=limit,
            offset=offset
        )
        
        return [WorkspaceResponse(**workspace) for workspace in workspaces]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Workspace Member Management
# =====================================================================================

@router.get("/{workspace_id}/members", response_model=List[WorkspaceMemberResponse])
async def get_workspace_members(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all members of a workspace"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify access
        if not await workspace_service.verify_workspace_access(workspace_id, current_user.id):
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        members = await workspace_service.get_workspace_members(
            workspace_id,
            current_user.id
        )
        
        return [WorkspaceMemberResponse(**member) for member in members]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{workspace_id}/members", response_model=WorkspaceMemberResponse)
async def add_workspace_member(
    workspace_id: str,
    request: WorkspaceMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new member to workspace"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify permissions
        if not await workspace_service.verify_workspace_permissions(
            workspace_id, current_user.id, ["admin", "owner"]
        ):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Add member
        member = await workspace_service.add_workspace_member(
            workspace_id,
            request.user_id,
            request.role,
            request.permissions,
            current_user.id
        )
        
        return WorkspaceMemberResponse(**member)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{workspace_id}/members/{member_id}")
async def update_workspace_member(
    workspace_id: str,
    member_id: str,
    request: WorkspaceMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update workspace member role and permissions"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify permissions
        if not await workspace_service.verify_workspace_permissions(
            workspace_id, current_user.id, ["admin", "owner"]
        ):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Update member
        member = await workspace_service.update_workspace_member(
            workspace_id,
            member_id,
            request.role,
            request.permissions,
            current_user.id
        )
        
        return WorkspaceMemberResponse(**member)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{workspace_id}/members/{member_id}")
async def remove_workspace_member(
    workspace_id: str,
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove member from workspace"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify permissions
        if not await workspace_service.verify_workspace_permissions(
            workspace_id, current_user.id, ["admin", "owner"]
        ):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Remove member
        success = await workspace_service.remove_workspace_member(
            workspace_id,
            member_id,
            current_user.id
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to remove member")
        
        return {"message": "Member removed successfully", "member_id": member_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Cross-Group Resource Management
# =====================================================================================

@router.get("/{workspace_id}/resources", response_model=List[WorkspaceResourceResponse])
async def get_workspace_resources(
    workspace_id: str,
    resource_type: Optional[ResourceType] = Query(None),
    group_name: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all resources linked to workspace"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify access
        if not await workspace_service.verify_workspace_access(workspace_id, current_user.id):
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        # Build filters
        filters = {}
        if resource_type:
            filters['resource_type'] = resource_type.value
        if group_name:
            filters['group_name'] = group_name
        
        resources = await workspace_service.get_workspace_resources(
            workspace_id,
            current_user.id,
            filters
        )
        
        return [WorkspaceResourceResponse(**resource) for resource in resources]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{workspace_id}/resources/link", response_model=WorkspaceResourceResponse)
async def link_resource_to_workspace(
    workspace_id: str,
    request: ResourceLinkRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Link a resource from any group to workspace"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify permissions
        if not await workspace_service.verify_workspace_permissions(
            workspace_id, current_user.id, ["editor", "admin", "owner"]
        ):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Link resource
        resource_link = await workspace_service.link_resource_to_workspace(
            workspace_id,
            request.resource_type.value,
            request.resource_id,
            request.group_name,
            request.link_configuration,
            request.access_permissions,
            current_user.id
        )
        
        return WorkspaceResourceResponse(**resource_link)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{workspace_id}/resources/{resource_link_id}")
async def unlink_resource_from_workspace(
    workspace_id: str,
    resource_link_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlink resource from workspace"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify permissions
        if not await workspace_service.verify_workspace_permissions(
            workspace_id, current_user.id, ["editor", "admin", "owner"]
        ):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Unlink resource
        success = await workspace_service.unlink_resource_from_workspace(
            workspace_id,
            resource_link_id,
            current_user.id
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to unlink resource")
        
        return {"message": "Resource unlinked successfully", "resource_link_id": resource_link_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{workspace_id}/resources/discover")
async def discover_linkable_resources(
    workspace_id: str,
    group_name: Optional[str] = Query(None),
    resource_type: Optional[ResourceType] = Query(None),
    search_query: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Discover resources that can be linked to workspace"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify access
        if not await workspace_service.verify_workspace_access(workspace_id, current_user.id):
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        # Build search criteria
        search_criteria = {
            'group_name': group_name,
            'resource_type': resource_type.value if resource_type else None,
            'search_query': search_query,
            'limit': limit
        }
        
        # Discover resources
        resources = await workspace_service.discover_linkable_resources(
            workspace_id,
            current_user.id,
            search_criteria
        )
        
        return {
            "workspace_id": workspace_id,
            "search_criteria": search_criteria,
            "discovered_resources": resources,
            "total_found": len(resources)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Workspace Templates
# =====================================================================================

@router.get("/templates/", response_model=List[Dict[str, Any]])
async def list_workspace_templates(
    template_type: Optional[WorkspaceType] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List available workspace templates"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        filters = {}
        if template_type:
            filters['template_type'] = template_type.value
        
        templates = await workspace_service.get_workspace_templates(
            user_id=current_user.id,
            filters=filters
        )
        
        return templates
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/templates/", response_model=Dict[str, Any])
async def create_workspace_template(
    request: WorkspaceTemplateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new workspace template"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Create template
        template = await workspace_service.create_workspace_template(
            name=request.name,
            description=request.description,
            template_configuration=request.template_configuration,
            default_groups=request.default_groups,
            default_resources=request.default_resources,
            access_control_template=request.access_control_template,
            creator_id=current_user.id
        )
        
        return template
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{workspace_id}/clone", response_model=WorkspaceResponse)
async def clone_workspace(
    workspace_id: str,
    new_name: str = Body(..., embed=True),
    clone_members: bool = Body(False, embed=True),
    clone_resources: bool = Body(True, embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clone an existing workspace"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify access to source workspace
        if not await workspace_service.verify_workspace_access(workspace_id, current_user.id):
            raise HTTPException(status_code=403, detail="Access denied to source workspace")
        
        # Clone workspace
        cloned_workspace = await workspace_service.clone_workspace(
            source_workspace_id=workspace_id,
            new_name=new_name,
            clone_members=clone_members,
            clone_resources=clone_resources,
            cloner_id=current_user.id
        )
        
        return WorkspaceResponse(**cloned_workspace)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Workspace Analytics
# =====================================================================================

@router.get("/{workspace_id}/analytics", response_model=WorkspaceAnalyticsResponse)
async def get_workspace_analytics(
    workspace_id: str,
    time_range: str = Query("7d", regex="^(1h|1d|7d|30d|90d)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive workspace analytics"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify access
        if not await workspace_service.verify_workspace_access(workspace_id, current_user.id):
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        # Get analytics
        analytics = await workspace_service.get_workspace_analytics(
            workspace_id,
            current_user.id,
            time_range
        )
        
        return WorkspaceAnalyticsResponse(**analytics)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{workspace_id}/activity-stream")
async def get_workspace_activity_stream(
    workspace_id: str,
    activity_type: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get real-time activity stream for workspace"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify access
        if not await workspace_service.verify_workspace_access(workspace_id, current_user.id):
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        # Get activity stream
        activities = await workspace_service.get_workspace_activity_stream(
            workspace_id,
            current_user.id,
            activity_type,
            limit,
            offset
        )
        
        return {
            "workspace_id": workspace_id,
            "activities": activities,
            "total_count": len(activities),
            "has_more": len(activities) == limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Workspace Collaboration
# =====================================================================================

@router.post("/{workspace_id}/invite")
async def invite_users_to_workspace(
    workspace_id: str,
    user_emails: List[str] = Body(..., embed=True),
    role: str = Body("viewer", embed=True),
    message: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite users to workspace via email"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify permissions
        if not await workspace_service.verify_workspace_permissions(
            workspace_id, current_user.id, ["admin", "owner"]
        ):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Send invitations
        invitations = await workspace_service.invite_users_to_workspace(
            workspace_id,
            user_emails,
            role,
            message,
            current_user.id
        )
        
        return {
            "workspace_id": workspace_id,
            "invitations_sent": len(invitations),
            "invitation_details": invitations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{workspace_id}/export")
async def export_workspace(
    workspace_id: str,
    export_format: str = Query("json", regex="^(json|yaml|csv)$"),
    include_resources: bool = Query(True),
    include_members: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export workspace configuration and data"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Verify permissions
        if not await workspace_service.verify_workspace_permissions(
            workspace_id, current_user.id, ["admin", "owner"]
        ):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Export workspace
        export_data = await workspace_service.export_workspace(
            workspace_id,
            export_format,
            include_resources,
            include_members,
            current_user.id
        )
        
        # Prepare response
        filename = f"workspace_{workspace_id}_export.{export_format}"
        headers = {
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": f"application/{export_format}"
        }
        
        return StreamingResponse(
            iter([export_data]),
            headers=headers
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Helper Functions
# =====================================================================================

async def _initialize_workspace_resources(
    workspace_id: str,
    groups: List[str],
    user_id: str,
    db: Session
):
    """Background task to initialize workspace with default resources"""
    try:
        workspace_service = RacineWorkspaceService(db)
        
        # Initialize default resources for each group
        for group_name in groups:
            await workspace_service.initialize_group_resources(
                workspace_id,
                group_name,
                user_id
            )
            
    except Exception as e:
        print(f"Failed to initialize workspace resources: {str(e)}")

# =====================================================================================
# Health Check
# =====================================================================================

@router.get("/health")
async def workspace_health_check():
    """Health check endpoint for workspace service"""
    return {
        "service": "racine-workspace",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }