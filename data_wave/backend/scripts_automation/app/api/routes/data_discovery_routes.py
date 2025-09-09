"""
Data Discovery API Routes
Provides endpoints for schema discovery, data exploration, and metadata browsing
Similar to Microsoft Purview's data discovery capabilities
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, status, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from sqlalchemy import desc
from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime
import asyncio
import json
import logging
from threading import Lock

from app.db_session import get_session
from app.services.data_source_service import DataSourceService
from app.services.data_source_connection_service import DataSourceConnectionService
from app.services.progress_bus import ProgressBus
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_SCAN_VIEW, PERMISSION_SCAN_EDIT
)
from app.models.scan_models import (
    DataSource, DiscoveryHistory, UserWorkspace, WorkspaceItem,
    WorkspacePreference, DataSourceType, DataSourceLocation
)
from pydantic import BaseModel, Field, conint, constr

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/data-discovery", tags=["data-discovery"])

# Global discovery lock to prevent multiple simultaneous discovery operations
_discovery_lock = Lock()
_active_discoveries: Dict[int, str] = {}  # data_source_id -> user_id

# Initialize services
connection_service = DataSourceConnectionService()

# Enhanced Request/Response Models
class SchemaDiscoveryRequest(BaseModel):
    data_source_id: int = Field(..., description="ID of the data source to discover")
    include_data_preview: bool = Field(default=False, description="Whether to include data previews")
    auto_catalog: bool = Field(default=False, description="Whether to automatically catalog discovered schema")
    max_tables_per_schema: int = Field(
        default=100, ge=1, le=1000,
        description="Maximum number of tables to discover per schema"
    )

class TablePreviewRequest(BaseModel):
    data_source_id: int = Field(..., description="ID of the data source")
    schema_name: str = Field(..., description="Schema name")
    table_name: str = Field(..., description="Table name")
    limit: int = Field(
        default=100, ge=1, le=1000,
        description="Maximum number of rows to preview"
    )

class ColumnProfileRequest(BaseModel):
    data_source_id: int = Field(..., description="ID of the data source")
    schema_name: str = Field(..., description="Schema name")
    table_name: str = Field(..., description="Table name")
    column_name: str = Field(..., description="Column name")

class TableSelectionRequest(BaseModel):
    data_source_id: int = Field(..., description="ID of the data source")
    selected_items: List[Dict[str, Any]] = Field(
        ...,
        description="List of selected items with their metadata"
    )

class WorkspaceRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Workspace name")
    description: Optional[str] = Field(None, description="Workspace description")
    selected_items: List[Dict[str, Any]] = Field(
        ...,
        description="List of selected items to save"
    )
    view_preferences: Dict[str, Any] = Field(
        default_factory=dict,
        description="User's view preferences"
    )

# Standard Response Model
class StandardResponse(BaseModel):
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Response data")
    error: Optional[str] = Field(default=None, description="Error message if any")

@router.post("/data-sources/{data_source_id}/discover-schema", response_model=StandardResponse)
async def discover_data_source_schema(
    data_source_id: int,
    request: SchemaDiscoveryRequest = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Discover the complete schema structure of a data source
    Returns hierarchical structure: databases -> schemas -> tables -> columns
    """
    # Check if discovery is already running for this data source
    with _discovery_lock:
        if data_source_id in _active_discoveries:
            return StandardResponse(
                success=False,
                message="Schema discovery is already running for this data source",
                error="Discovery already in progress",
                data={"active_user": _active_discoveries[data_source_id]}
            )
        # Mark this discovery as active
        _active_discoveries[data_source_id] = current_user.get("username", "unknown")
    
    try:
        # Get data source
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            return StandardResponse(
                success=False,
                message="Data source not found",
                error="Data source not found",
                data=None
            )
        
        # Validate data source type
        if data_source.source_type not in [e.value for e in DataSourceType]:
            return StandardResponse(
                success=False,
                message="Invalid data source type",
                error=f"Unsupported data source type: {data_source.source_type}",
                data=None
            )
        
        # Perform schema discovery
        discovery_result = await connection_service.discover_schema(data_source)
        
        if not discovery_result["success"]:
            return StandardResponse(
                success=False,
                message="Schema discovery failed",
                error=discovery_result.get("error", "Unknown error"),
                data=None
            )
        
        # If auto_catalog is enabled, also catalog the discovered schema
        catalog_result = None
        if request.auto_catalog:
            try:
                from app.services.catalog_service import EnhancedCatalogService
                catalog_service = EnhancedCatalogService()
                catalog_result = await catalog_service.discover_and_catalog_schema(
                    session, 
                    data_source_id, 
                    current_user.get("username", "system"),
                    force_refresh=True
                )
            except Exception as e:
                logger.warning(f"Auto-catalog failed but discovery succeeded: {str(e)}")
        
        response_data = {
            "data_source_id": data_source_id,
            "schema_structure": discovery_result["schema"],
            "summary": discovery_result["summary"],
            "discovery_time": discovery_result["discovery_time"]
        }
        
        if catalog_result:
            response_data["catalog_result"] = {
                "success": catalog_result.success,
                "discovered_items": catalog_result.discovered_items,
                "processing_time_seconds": catalog_result.processing_time_seconds,
                "errors": catalog_result.errors,
                "warnings": catalog_result.warnings
            }
        
        return StandardResponse(
            success=True,
            message="Schema discovery completed successfully" + (" with auto-cataloging" if catalog_result else ""),
            data=response_data,
            error=None
        )
        
    except Exception as e:
        logger.error(f"Error in schema discovery: {str(e)}")
        return StandardResponse(
            success=False,
            message="Schema discovery failed",
            error=str(e),
            data=None
        )
    finally:
        # Always clean up the discovery lock
        with _discovery_lock:
            _active_discoveries.pop(data_source_id, None)

@router.get("/data-sources/{data_source_id}/discovery-status")
async def get_discovery_status(
    data_source_id: int,
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get the current discovery status for a data source
    """
    with _discovery_lock:
        is_running = data_source_id in _active_discoveries
        active_user = _active_discoveries.get(data_source_id)
    
    return StandardResponse(
        success=True,
        message="Discovery status retrieved",
        data={
            "data_source_id": data_source_id,
            "is_running": is_running,
            "active_user": active_user,
            "can_start": not is_running
        },
        error=None
    )

@router.post("/data-sources/{data_source_id}/stop-discovery")
async def stop_discovery(
    data_source_id: int,
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """
    Stop any running discovery for a data source
    """
    with _discovery_lock:
        was_running = data_source_id in _active_discoveries
        if was_running:
            _active_discoveries.pop(data_source_id, None)
    
    return StandardResponse(
        success=True,
        message="Discovery stopped" if was_running else "No discovery was running",
        data={
            "data_source_id": data_source_id,
            "was_running": was_running,
            "stopped_by": current_user.get("username", "unknown")
        },
        error=None
    )

@router.post("/data-sources/{data_source_id}/discover-and-catalog", response_model=StandardResponse)
async def discover_and_catalog_schema(
    data_source_id: int,
    force_refresh: bool = Query(default=False, description="Force refresh of cached discovery"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Discover schema and automatically catalog all discovered items.
    This uses the enhanced catalog service for real-time integration.
    """
    try:
        from app.services.catalog_service import EnhancedCatalogService
        
        # Get data source
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            return StandardResponse(
                success=False,
                message="Data source not found",
                error="Data source not found",
                data=None
            )
        
        # Perform discovery and cataloging
        catalog_service = EnhancedCatalogService()
        discovery_result = await catalog_service.discover_and_catalog_schema(
            session, 
            data_source_id, 
            current_user.get("username", "system"),
            force_refresh=force_refresh
        )
        return StandardResponse(
            success=discovery_result.success,
            message="Schema discovery and cataloging completed" if discovery_result.success else "Discovery failed",
            data={
                "data_source_id": data_source_id,
                "data_source_info": discovery_result.data_source_info,
                "discovered_items": discovery_result.discovered_items,
                "processing_time_seconds": discovery_result.processing_time_seconds,
                "errors": discovery_result.errors,
                "warnings": discovery_result.warnings,
                "cached": not force_refresh and (discovery_result.processing_time_seconds or 0) < 1.0
            },
            error="; ".join(discovery_result.errors) if getattr(discovery_result, 'errors', None) else None
        )
    except Exception as e:
        logger.error(f"Error in discovery and cataloging: {str(e)}")
        return StandardResponse(
            success=False,
            message="Discovery and cataloging failed",
            error=str(e),
            data=None
        )
# =============================
# Real-time discovery progress
# =============================

@router.get("/data-sources/{data_source_id}/discover-schema/progress")
async def stream_discovery_progress(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Server-Sent Events stream for discovery progress.
    Emits JSON lines with fields: percentage, status, timestamp.
    """
    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            # Send last known event immediately if exists (better UX)
            last = ProgressBus.last_event(data_source_id)
            if last:
                yield f"data: {json.dumps(last)}\n\n"
            async for evt in ProgressBus.subscribe(data_source_id):
                yield f"data: {json.dumps(evt)}\n\n"
        except asyncio.CancelledError:
            return
        except Exception as e:
            logger.error(f"SSE discovery progress error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    })


async def validate_websocket_token(token: str, db: Session) -> Dict[str, Any]:
    """Validate JWT token for WebSocket connections using the same logic as get_current_user"""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Use the same session validation as the main authentication system
    from app.services.auth_service import get_session_by_token
    user_session = get_session_by_token(db, token)
    if not user_session or not getattr(user_session, "user", None):
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user = user_session.user
    return {
        "id": user.id,
        "email": user.email,
        "username": getattr(user, "display_name", user.email),
        "role": user.role,
        "department": getattr(user, "department", None),
        "region": getattr(user, "region", None)
    }

@router.websocket("/data-sources/{data_source_id}/discover-schema/progress/ws")
async def websocket_discovery_progress(
    websocket: WebSocket,
    data_source_id: int
):
    """
    WebSocket for discovery progress. Sends JSON messages with percentage and status.
    """
    # Extract token from query parameters
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return
    
    # Validate token using proper JWT/session validation
    try:
        from app.db_session import get_session
        db = next(get_session())
        current_user = await validate_websocket_token(token, db)
        
        # Check if user has permission to access data discovery
        from app.api.security.rbac import check_permission
        if not check_permission("scan.view", current_user, db):
            await websocket.close(code=1008, reason="Insufficient permissions")
            return
            
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {str(e)}")
        await websocket.close(code=1008, reason="Invalid authentication token")
        return
    
    await websocket.accept()
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "data_source_id": data_source_id,
            "user": {
                "id": current_user["id"],
                "username": current_user["username"],
                "role": current_user["role"]
            },
            "timestamp": datetime.now().isoformat()
        })
        
        # Subscribe to progress events
        async for evt in ProgressBus.subscribe(data_source_id):
            await websocket.send_json(evt)
    except WebSocketDisconnect:
        # Client gone; just return
        return
    except Exception as e:
        logger.error(f"WS discovery progress error: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except Exception:
            pass
        return

@router.post("/data-sources/{data_source_id}/sync-catalog", response_model=StandardResponse)
async def sync_catalog_with_data_source(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """
    Synchronize catalog with current state of data source.
    This will update existing items and detect changes.
    """
    try:
        from app.services.catalog_service import EnhancedCatalogService
        
        # Get data source
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            return StandardResponse(
                success=False,
                message="Data source not found",
                error="Data source not found",
                data=None
            )
        
        # Perform synchronization
        catalog_service = EnhancedCatalogService()
        sync_result = await catalog_service.sync_catalog_with_data_source(
            session, 
            data_source_id, 
            current_user.get("username", "system")
        )
        
        return StandardResponse(
            success=sync_result.success,
            message="Catalog synchronization completed" if sync_result.success else "Synchronization failed",
            data={
                "data_source_id": data_source_id,
                "items_created": sync_result.items_created,
                "items_updated": sync_result.items_updated,
                "items_deleted": sync_result.items_deleted,
                "sync_duration_seconds": sync_result.sync_duration_seconds,
                "errors": sync_result.errors
            },
            error="; ".join(sync_result.errors) if sync_result.errors else None
        )
        
    except Exception as e:
        logger.error(f"Error in catalog synchronization: {str(e)}")
        return StandardResponse(
            success=False,
            message="Catalog synchronization failed",
            error=str(e),
            data=None
        )

@router.post("/data-sources/{data_source_id}/test-connection", response_model=StandardResponse)
async def test_data_source_connection(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Test connection to a data source with detailed diagnostics."""
    try:
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            return StandardResponse(
                success=False,
                message="Data source not found",
                error="Data source not found",
                data=None
            )
        
        result = await connection_service.test_connection(data_source)
        
        if not result["success"]:
            return StandardResponse(
                success=False,
                message="Connection test failed",
                error=result.get("message"),
                data=result
            )
            
        return StandardResponse(
            success=True,
            message="Connection test successful",
            data=result,
            error=None
        )
        
    except Exception as e:
        logger.error(f"Error testing connection: {str(e)}")
        return StandardResponse(
            success=False,
            message="Connection test failed",
            error=str(e),
            data=None
        )


@router.post("/data-sources/{data_source_id}/preview-table")
async def preview_table_data(
    data_source_id: int,
    request: TablePreviewRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get preview of table data with basic profiling
    """
    try:
        # Get data source
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        # Get table preview
        preview_result = await connection_service.get_table_preview(
            data_source,
            request.schema_name,
            request.table_name,
            request.limit
        )
        
        if not preview_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Table preview failed: {preview_result.get('error', 'Unknown error')}"
            )
        
        return {
            "data_source_id": data_source_id,
            "schema_name": request.schema_name,
            "table_name": request.table_name,
            "preview_data": preview_result["preview_data"],
            "execution_time_ms": preview_result.get("execution_time_ms", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in table preview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Table preview failed: {str(e)}"
        )


@router.post("/data-sources/profile-column")
async def profile_column_data(
    request: ColumnProfileRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get detailed column profile and statistics
    """
    try:
        # Get data source
        data_source = DataSourceService.get_data_source(session, request.data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        # Get column profile
        profile_result = await connection_service.get_column_profile(
            data_source, 
            request.schema_name, 
            request.table_name, 
            request.column_name
        )
        
        if not profile_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Column profiling failed: {profile_result.get('error', 'Unknown error')}"
            )
        
        return {
            "data_source_id": request.data_source_id,
            "schema_name": request.schema_name,
            "table_name": request.table_name,
            "column_name": request.column_name,
            "profile": profile_result["profile"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in column profiling: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Column profiling failed: {str(e)}"
        )


@router.get("/data-sources/{data_source_id}/connection-status")
async def get_connection_status(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get current connection status and last known state
    """
    try:
        # Get data source
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        return {
            "data_source_id": data_source_id,
            "status": data_source.status,
            "last_updated": data_source.updated_at,
            "health_score": data_source.health_score,
            "connection_details": {
                "host": data_source.host,
                "port": data_source.port,
                "database": data_source.database_name,
                "source_type": data_source.source_type,
                "location": data_source.location
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting connection status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get connection status: {str(e)}"
        )


@router.post("/data-sources/validate-selection")
async def validate_data_selection(
    request: TableSelectionRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Validate user's data selection and estimate impact
    """
    try:
        # Get data source
        data_source = DataSourceService.get_data_source(session, request.data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        # Analyze selection
        selection_analysis = {
            "total_selected_items": len(request.selected_items),
            "estimated_tables": 0,
            "estimated_columns": 0,
            "estimated_rows": 0,
            "selection_breakdown": {
                "databases": 0,
                "schemas": 0,
                "tables": 0,
                "columns": 0
            }
        }
        
        # Count selection types
        for item in request.selected_items:
            item_type = item.get("type", "unknown")
            if item_type in selection_analysis["selection_breakdown"]:
                selection_analysis["selection_breakdown"][item_type] += 1
        
        return {
            "data_source_id": request.data_source_id,
            "selection_valid": True,
            "analysis": selection_analysis,
            "recommendations": [
                "Consider starting with a subset of tables for initial exploration",
                "Large selections may take longer to process",
                "Ensure you have appropriate permissions for all selected items"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating selection: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Selection validation failed: {str(e)}"
        )


@router.get("/data-sources/{data_source_id}/discovery-history")
async def get_discovery_history(
    data_source_id: int,
    limit: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get history of schema discoveries for this data source
    """
    try:
        # Get data source
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        # Get discovery history from database
        history = list(session.execute(
            select(DiscoveryHistory)
            .where(DiscoveryHistory.data_source_id == data_source_id)
            .limit(limit)
        ).all())
        
        # Sort in memory since SQLModel is having issues with order_by
        history.sort(key=lambda x: x.discovery_time, reverse=True)
        
        # Format response
        discovery_history = []
        for entry in history:
            discovery_history.append({
                "discovery_id": entry.id,
                "discovery_time": entry.discovery_time.isoformat(),
                "status": entry.status,
                "tables_discovered": entry.tables_discovered,
                "columns_discovered": entry.columns_discovered,
                "duration_seconds": entry.duration_seconds,
                "triggered_by": entry.triggered_by,
                "error_message": entry.error_message,
                "details": entry.discovery_details
            })
        
        return {
            "data_source_id": data_source_id,
            "history": discovery_history,
            "total_discoveries": len(discovery_history)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting discovery history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get discovery history: {str(e)}"
        )

    
@router.post("/data-sources/{data_source_id}/save-workspace")
async def save_data_workspace(
    data_source_id: int,
    workspace_data: WorkspaceRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """
    Save user's workspace configuration for this data source
    """
    try:
        # Get data source
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        # Create new workspace
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
            
        workspace = UserWorkspace(
            name=workspace_data.name,
            description=workspace_data.description,
            data_source_id=data_source_id,
            user_id=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(workspace)
        session.flush()  # Get workspace ID
        
        if not workspace.id:
            raise HTTPException(status_code=500, detail="Failed to create workspace")

        # Add new items
        for item in workspace_data.selected_items:
            item_type = item.get("type")
            item_path = item.get("path")
            if not item_type or not item_path:
                continue  # Skip invalid items
                
            workspace_item = WorkspaceItem(
                workspace_id=workspace.id,
                item_type=item_type,
                item_path=item_path,
                metadata=item
            )
            session.add(workspace_item)
        
        # Add preferences
        for key, value in workspace_data.view_preferences.items():
            if not key:
                continue  # Skip invalid preferences
                
            preference = WorkspacePreference(
                workspace_id=workspace.id,
                preference_key=key,
                preference_value=str(value)
            )
            session.add(preference)
        
        session.commit()
        
        return {
            "success": True,
            "workspace": {
                "workspace_id": workspace.id,
                "data_source_id": data_source_id,
                "user_id": current_user.get("user_id"),
                "workspace_name": workspace.name,
                "description": workspace.description,
                "selected_items": workspace_data.selected_items,
                "view_preferences": workspace_data.view_preferences,
                "created_at": workspace.created_at.isoformat(),
                "updated_at": workspace.updated_at.isoformat()
            },
            "message": "Workspace saved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving workspace: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save workspace: {str(e)}")

@router.get("/data-sources/{data_source_id}/workspaces")
async def get_user_workspaces(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get user's saved workspaces for this data source
    """
    try:
        # Get data source
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        # Get workspaces from database
        workspaces = session.execute(
            select(UserWorkspace)
            .where(UserWorkspace.data_source_id == data_source_id)
            .where(UserWorkspace.user_id == current_user.get("user_id"))
        ).all()
        
        # Format response
        workspace_list = []
        for workspace in workspaces:
            # Get items
            items = session.execute(
                select(WorkspaceItem)
                .where(WorkspaceItem.workspace_id == workspace.id)
            ).all()
            
            # Get preferences
            preferences = session.execute(
                select(WorkspacePreference)
                .where(WorkspacePreference.workspace_id == workspace.id)
            ).all()
            
            workspace_list.append({
                "workspace_id": workspace.id,
                "name": workspace.name,
                "description": workspace.description,
                "created_at": workspace.created_at.isoformat(),
                "updated_at": workspace.updated_at.isoformat(),
                "item_count": len(items),
                "items": [item.metadata for item in items],
                "preferences": {pref.preference_key: pref.preference_value for pref in preferences}
            })
        
        return {
            "data_source_id": data_source_id,
            "workspaces": workspace_list,
            "total_workspaces": len(workspace_list)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workspaces: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workspaces: {str(e)}")