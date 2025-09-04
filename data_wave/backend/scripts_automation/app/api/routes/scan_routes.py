from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any, cast
from sqlalchemy import func
from app.db_session import get_session
from app.models.scan_models import (
    DataSource, DataSourceHealthResponse, DataSourceStatsResponse,
    DataSourceType, DataSourceLocation, DataSourceStatus,
    Environment, Criticality, DataClassification, ScanFrequency,
    CloudProvider,
    ScanRuleSet, Scan, ScanStatus, ScanResult, ScanSchedule
)
from app.services.data_source_service import DataSourceService
from app.services.scan_rule_set_service import ScanRuleSetService
from app.services.scan_service import ScanService
from app.services.scan_scheduler_service import ScanSchedulerService
from app.services.data_source_connection_service import DataSourceConnectionService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_SCAN_VIEW, PERMISSION_SCAN_CREATE, 
    PERMISSION_SCAN_EDIT, PERMISSION_SCAN_DELETE
)
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/scan", tags=["scan"])

# Initialize services
connection_service = DataSourceConnectionService()




# Pydantic models for request/response
class DataSourceCreate(BaseModel):
    name: str
    source_type: str
    location: str
    host: str
    port: int
    username: str
    password: str
    database_name: Optional[str] = None
    description: Optional[str] = None
    connection_properties: Optional[Dict[str, Any]] = None
    environment: Optional[Environment] = None
    criticality: Optional[Criticality] = None
    data_classification: Optional[DataClassification] = None
    owner: Optional[str] = None
    team: Optional[str] = None
    tags: Optional[List[str]] = None
    scan_frequency: Optional[ScanFrequency] = None
    monitoring_enabled: Optional[bool] = Field(default=True, description="Enable runtime monitoring for this data source")
    backup_enabled: Optional[bool] = Field(default=False, description="Enable automated backups for this data source")
    encryption_enabled: Optional[bool] = Field(default=False, description="Store credentials encrypted at rest")

class DataSourceBulkUpdateRequest(BaseModel):
    data_source_ids: List[int]
    updates: Dict[str, Any]


class DataSourceResponse(BaseModel):
    id: int
    name: str
    source_type: str
    location: str
    host: str
    port: int
    username: str
    database_name: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status: str
    environment: Optional[Environment] = None
    criticality: Optional[Criticality] = None
    data_classification: Optional[DataClassification] = None
    owner: Optional[str] = None
    team: Optional[str] = None
    tags: Optional[List[str]] = None
    health_score: Optional[int] = None
    compliance_score: Optional[int] = None
    entity_count: Optional[int] = None
    size_gb: Optional[float] = None
    last_scan: Optional[datetime] = None
    next_scan: Optional[datetime] = None
    monitoring_enabled: bool
    backup_enabled: bool
    encryption_enabled: bool


class DataSourceUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    database_name: Optional[str] = None
    description: Optional[str] = None
    connection_properties: Optional[Dict[str, Any]] = None
    environment: Optional[Environment] = None
    criticality: Optional[Criticality] = None
    data_classification: Optional[DataClassification] = None
    owner: Optional[str] = None
    team: Optional[str] = None
    tags: Optional[List[str]] = None
    scan_frequency: Optional[ScanFrequency] = None
    monitoring_enabled: Optional[bool] = None
    backup_enabled: Optional[bool] = None
    encryption_enabled: Optional[bool] = None


class DataSourceMetricsUpdateRequest(BaseModel):
    health_score: Optional[int] = None
    compliance_score: Optional[int] = None
    entity_count: Optional[int] = None
    size_gb: Optional[float] = None
    avg_response_time: Optional[int] = None
    error_rate: Optional[float] = None
    uptime_percentage: Optional[float] = None


class ScanRuleSetCreate(BaseModel):
    name: str
    data_source_id: Optional[int] = None
    description: Optional[str] = None
    include_schemas: Optional[List[str]] = None
    exclude_schemas: Optional[List[str]] = None
    include_tables: Optional[List[str]] = None
    exclude_tables: Optional[List[str]] = None
    include_columns: Optional[List[str]] = None
    exclude_columns: Optional[List[str]] = None
    sample_data: bool = False
    sample_size: Optional[int] = 100


class ScanRuleSetResponse(BaseModel):
    id: int
    name: str
    data_source_id: Optional[int] = None
    description: Optional[str] = None
    include_schemas: Optional[List[str]] = None
    exclude_schemas: Optional[List[str]] = None
    include_tables: Optional[List[str]] = None
    exclude_tables: Optional[List[str]] = None
    include_columns: Optional[List[str]] = None
    exclude_columns: Optional[List[str]] = None
    sample_data: bool
    sample_size: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class ScanRuleSetUpdate(BaseModel):
    name: Optional[str] = None
    data_source_id: Optional[int] = None
    description: Optional[str] = None
    include_schemas: Optional[List[str]] = None
    exclude_schemas: Optional[List[str]] = None
    include_tables: Optional[List[str]] = None
    exclude_tables: Optional[List[str]] = None
    include_columns: Optional[List[str]] = None
    exclude_columns: Optional[List[str]] = None
    sample_data: Optional[bool] = None
    sample_size: Optional[int] = None


class ScanCreate(BaseModel):
    name: str
    data_source_id: int
    scan_rule_set_id: Optional[int] = None
    description: Optional[str] = None


class ScanResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    data_source_id: int
    scan_rule_set_id: Optional[int] = None
    status: str
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    scan_id: str


class ScanResultResponse(BaseModel):
    id: int
    scan_id: int
    schema_name: Optional[str] = None
    table_name: str
    column_name: Optional[str] = None
    data_type: Optional[str] = None
    nullable: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime


class ScanScheduleCreate(BaseModel):
    name: str
    data_source_id: int
    scan_rule_set_id: int
    cron_expression: str
    description: Optional[str] = None
    enabled: bool = True


class ScanScheduleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    data_source_id: int
    scan_rule_set_id: int
    cron_expression: str
    enabled: bool
    created_at: datetime
    updated_at: datetime
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None


class ScanScheduleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    data_source_id: Optional[int] = None
    scan_rule_set_id: Optional[int] = None
    cron_expression: Optional[str] = None
    enabled: Optional[bool] = None

#==============================================
# Data Source routes
#==============================================




# Data Source routes
@router.post("/data-sources", response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
async def create_data_source(
    data_source: DataSourceCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_CREATE))
):
    """Create a new data source."""
    try:
        # Create data source with current user context
        db_data_source = DataSourceService.create_data_source(
            session=session,
            name=data_source.name,
            source_type=data_source.source_type,
            location=data_source.location,
            host=data_source.host,
            port=data_source.port,
            username=data_source.username,
            password=data_source.password,
            database_name=data_source.database_name,
            description=data_source.description,
            connection_properties=data_source.connection_properties,
            environment=data_source.environment,
            criticality=data_source.criticality,
            data_classification=data_source.data_classification,
            owner=data_source.owner,
            team=data_source.team,
            tags=data_source.tags,
            scan_frequency=data_source.scan_frequency,
            created_by=current_user.get("username") or current_user.get("email")
        )
        
        return db_data_source
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating data source: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/data-sources", response_model=List[DataSourceResponse])
async def get_data_sources(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    environment: Optional[str] = Query(None),
    criticality: Optional[str] = Query(None),
    owner: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get all data sources with filtering and pagination."""
    try:
        # Get user context for RBAC filtering
        current_username = current_user.get("username") or current_user.get("email")
        is_admin = current_user.get("role") == "admin"
        
        # Apply filters in the service layer with RBAC
        data_sources = DataSourceService.get_all_data_sources(
            session=session,
            current_user=current_username,
            include_all=is_admin
        )
        
        # Filter results
        filtered_sources = []
        for ds in data_sources:
            if type and ds.source_type != type:
                continue
            if status and ds.status != status:
                continue
            if environment and ds.environment != environment:
                continue
            if criticality and ds.criticality != criticality:
                continue
            if owner and ds.owner != owner:
                continue
            if team and ds.team != team:
                continue
            if search:
                search_lower = search.lower()
                if not (search_lower in ds.name.lower() or 
                       search_lower in (ds.description or "").lower() or
                       search_lower in ds.host.lower()):
                    continue
            filtered_sources.append(ds)
        
        # Apply pagination                              
        start = (page - 1) * limit
        end = start + limit
        paginated_sources = filtered_sources[start:end]
        
        return paginated_sources
    except Exception as e:
        logger.error(f"Error getting data sources: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/data-sources/{data_source_id}", response_model=DataSourceResponse)
async def get_data_source(
    data_source_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get a data source by ID with RBAC filtering."""
    current_username = current_user.get("username") or current_user.get("email")
    data_source = DataSourceService.get_data_source(
        session=session, 
        data_source_id=data_source_id,
        current_user=current_username
    )
    if not data_source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
    return data_source


@router.put("/data-sources/{data_source_id}", response_model=DataSourceResponse)
async def update_data_source(
    data_source_id: int,
    data_source: DataSourceUpdate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Update a data source."""
    try:
        # Convert to dict and remove None values
        update_data = data_source.dict(exclude_unset=True)
        
        # Handle password update separately
        if "password" in update_data:
            update_data["password_secret"] = update_data.pop("password")
        
        updated_data_source = DataSourceService.update_data_source(
            session=session,
            data_source_id=data_source_id,
            updated_by=current_user.get("username") or current_user.get("email"),
            **update_data
        )
        
        if not updated_data_source:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
        
        return updated_data_source
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating data source: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete("/data-sources/{data_source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_data_source(
    data_source_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """Delete a data source."""
    success = DataSourceService.delete_data_source(session, data_source_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
    return None

@router.post("/data-sources/{data_source_id}/validate", status_code=status.HTTP_200_OK)
async def validate_data_source_connection(
    data_source_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Validate connection to a data source."""
    data_source = DataSourceService.get_data_source(session, data_source_id)
    if not data_source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
    
    try:
        result = DataSourceService.validate_connection(data_source)
        return result
    except Exception as e:
        logger.error(f"Error validating connection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating connection: {str(e)}"
        )

@router.get("/data-sources/{data_source_id}/health", response_model=DataSourceHealthResponse)
async def get_data_source_health(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get health status for a data source."""
    try:
        health = DataSourceService.get_data_source_health(session, data_source_id)
        return health
    except Exception as e:
        logger.error(f"Error getting data source health: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting data source health: {str(e)}"
        )


@router.get("/data-sources/{data_source_id}/stats", response_model=DataSourceStatsResponse)
async def get_data_source_stats(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get statistics for a data source."""
    try:
        stats = DataSourceService.get_data_source_stats(session, data_source_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting data source stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting data source stats: {str(e)}"
        )


@router.put("/data-sources/{data_source_id}/metrics")
async def update_data_source_metrics(
    data_source_id: int,
    metrics: DataSourceMetricsUpdateRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Update performance and health metrics for a data source."""
    try:
        updated = DataSourceService.update_data_source_metrics(
            session=session,
            data_source_id=data_source_id,
            metrics=metrics.dict(exclude_unset=True)
        )
        
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
        
        return {"message": "Metrics updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating metrics: {str(e)}"
        )


@router.post("/data-sources/{data_source_id}/toggle-favorite")
async def toggle_favorite_data_source(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Toggle favorite status for a data source."""
    try:
        user_id = current_user.get("user_id", "anonymous")
        success = DataSourceService.toggle_favorite(session, data_source_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Data source not found")
        return {"message": "Favorite status updated"}
    except Exception as e:
        logger.error(f"Error toggling favorite: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating favorite: {str(e)}")

# Enhanced scan trigger
@router.post("/data-sources/{data_source_id}/scan")
async def start_data_source_scan(
    data_source_id: int,
    scan_name: Optional[str] = Body(None),
    description: Optional[str] = Body(None),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_CREATE))
):
    """Start a new scan for a data source."""
    try:
        # Create and execute scan
        scan_name = scan_name or f"Auto Scan - {datetime.now().isoformat()}"
        scan = ScanService.create_scan(
            session=session,
            name=scan_name,
            data_source_id=data_source_id,
            description=description
        )

        # Execute the scan
        if scan.id is None:
            raise HTTPException(status_code=500, detail="Scan ID is None after creation")
        result = ScanService.execute_scan(session, scan.id)
        return result
    except Exception as e:
        logger.error(f"Error starting scan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting scan: {str(e)}")


@router.post("/data-sources/bulk-update")
async def bulk_update_data_sources(
    data_source_ids: List[int],
    updates: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Bulk update multiple data sources."""
    try:
        updated_sources = DataSourceService.bulk_update_data_sources(
            session=session,
            data_source_ids=data_source_ids,
            updates=updates
        )
        
        return {
            "message": f"Updated {len(updated_sources)} data sources",
            "updated_ids": [ds.id for ds in updated_sources]
        }
    except Exception as e:
        logger.error(f"Error in bulk update: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in bulk update: {str(e)}"
        )

@router.delete("/data-sources/bulk-delete")
async def bulk_delete_data_sources(
    data_source_ids: List[int] = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """Bulk delete multiple data sources."""
    try:
        for data_source_id in data_source_ids:
            success = DataSourceService.delete_data_source(session, data_source_id)
            if not success:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Data source {data_source_id} not found"
                )
        return {"message": f"Successfully deleted {len(data_source_ids)} data sources"}
    except Exception as e:
        logger.error(f"Error in bulk delete: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting data sources: {str(e)}")


# ---------------------------------------------------------------------------
# Helper endpoints for UI metadata
# ---------------------------------------------------------------------------


@router.get("/data-sources/enums")
async def get_data_source_enums(current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))):
    """Return lists of enum values required by the front-end for drop-downs."""
    return {
        "source_types": [e.value for e in DataSourceType],
        "locations": [e.value for e in DataSourceLocation],
        "statuses": [e.value for e in DataSourceStatus],
        "cloud_providers": [e.value for e in CloudProvider],
        "environments": [e.value for e in Environment],
        "criticalities": [e.value for e in Criticality],
        "data_classifications": [e.value for e in DataClassification],
        "scan_frequencies": [e.value for e in ScanFrequency]
    }


# ---------------------------------------------------------------------------
# Favorites management
# ---------------------------------------------------------------------------


@router.get("/data-sources/favorites", response_model=List[DataSourceResponse])
async def get_user_favorite_data_sources(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Return the authenticated user's favorite data sources."""
    user_id = current_user.get("user_id", "anonymous")
    return DataSourceService.get_user_favorites(session, user_id)


# ---------------------------------------------------------------------------
# Monitoring / Backup toggles
# ---------------------------------------------------------------------------


@router.post("/data-sources/{data_source_id}/toggle-monitoring")
async def toggle_monitoring(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Enable/disable monitoring for a specific data source."""
    ds = DataSourceService.get_data_source(session, data_source_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Data source not found")

    updated = DataSourceService.update_data_source(
        session,
        data_source_id,
        monitoring_enabled=not bool(ds and getattr(ds, "monitoring_enabled", False))
    )
    return {"message": f"Monitoring set to {updated.monitoring_enabled}", "monitoring_enabled": updated.monitoring_enabled}


@router.post("/data-sources/{data_source_id}/toggle-backup")
async def toggle_backup(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Enable/disable automated backups for a specific data source."""
    ds = DataSourceService.get_data_source(session, data_source_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Data source not found")

    updated = DataSourceService.update_data_source(
        session,
        data_source_id,
        backup_enabled=not bool(ds and getattr(ds, "backup_enabled", False))
    )
    return {"message": f"Backup set to {updated.backup_enabled}", "backup_enabled": updated.backup_enabled}


# Scan Rule Set routes
@router.post("/rule-sets", response_model=ScanRuleSetResponse, status_code=status.HTTP_201_CREATED)
async def create_scan_rule_set(
    rule_set: ScanRuleSetCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_CREATE))
):
    """Create a new scan rule set."""
    try:
        db_rule_set = ScanRuleSetService.create_scan_rule_set(
            session=session,
            name=rule_set.name,
            data_source_id=rule_set.data_source_id,
            description=rule_set.description,
            include_schemas=rule_set.include_schemas,
            exclude_schemas=rule_set.exclude_schemas,
            include_tables=rule_set.include_tables,
            exclude_tables=rule_set.exclude_tables,
            include_columns=rule_set.include_columns,
            exclude_columns=rule_set.exclude_columns,
            sample_data=rule_set.sample_data,
            sample_size=rule_set.sample_size
        )
        
        return db_rule_set
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating scan rule set: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/rule-sets", response_model=List[ScanRuleSetResponse])
async def get_scan_rule_sets(
    data_source_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get all scan rule sets, optionally filtered by data source ID."""
    if data_source_id is not None:
        return ScanRuleSetService.get_scan_rule_sets_by_data_source(session, data_source_id)
    return ScanRuleSetService.get_all_scan_rule_sets(session)


@router.get("/rule-sets/{rule_set_id}", response_model=ScanRuleSetResponse)
async def get_scan_rule_set(
    rule_set_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get a scan rule set by ID."""
    rule_set = ScanRuleSetService.get_scan_rule_set(session, rule_set_id)
    if not rule_set:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan rule set not found")
    return rule_set


@router.put("/rule-sets/{rule_set_id}", response_model=ScanRuleSetResponse)
async def update_scan_rule_set(
    rule_set_id: int,
    rule_set: ScanRuleSetUpdate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Update a scan rule set."""
    try:
        # Convert to dict and remove None values
        update_data = rule_set.dict(exclude_unset=True)
        
        updated_rule_set = ScanRuleSetService.update_scan_rule_set(
            session=session,
            scan_rule_set_id=rule_set_id,
            **update_data
        )
        
        if not updated_rule_set:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan rule set not found")
        
        return updated_rule_set
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating scan rule set: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete("/rule-sets/{rule_set_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan_rule_set(
    rule_set_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """Delete a scan rule set."""
    success = ScanRuleSetService.delete_scan_rule_set(session, rule_set_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan rule set not found")
    return None


#==============================================
# Scan routes
#==============================================


# Scan routes
@router.post("/scans", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(
    scan: ScanCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_CREATE))
):
    """Create a new scan."""
    try:
        db_scan = ScanService.create_scan(
            session=session,
            name=scan.name,
            data_source_id=scan.data_source_id,
            scan_rule_set_id=scan.scan_rule_set_id,
            description=scan.description
        )
        
        return db_scan
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating scan: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/scans", response_model=List[ScanResponse])
async def get_scans(
    data_source_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Get all scans, optionally filtered by data source ID or status."""
    if data_source_id is not None:
        return ScanService.get_scans_by_data_source(session, data_source_id)
    if status is not None:
        return ScanService.get_scans_by_status(session, status)
    return ScanService.get_all_scans(session)


@router.get("/scans/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: int, session: Session = Depends(get_session)):
    """Get a scan by ID."""
    scan = ScanService.get_scan(session, scan_id)
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    return scan


@router.post("/scans/{scan_id}/execute", status_code=status.HTTP_200_OK)
async def execute_scan(scan_id: int, session: Session = Depends(get_session)):
    """Execute a scan."""
    try:
        result = ScanService.execute_scan(session, scan_id)
        if not result["success"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing scan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing scan: {str(e)}"
        )


@router.get("/scans/{scan_id}/results", response_model=List[ScanResultResponse])
async def get_scan_results(
    scan_id: int,
    schema_name: Optional[str] = Query(None),
    table_name: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Get scan results, optionally filtered by schema and table name."""
    # Check if scan exists
    scan = ScanService.get_scan(session, scan_id)
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    
    # Get results based on filters
    if schema_name and table_name:
        return ScanService.get_scan_results_by_table(session, scan_id, schema_name, table_name)
    elif schema_name:
        return ScanService.get_scan_results_by_schema(session, scan_id, schema_name)
    else:
        return ScanService.get_scan_results(session, scan_id)


@router.get("/scans/{scan_id}/summary")
async def get_scan_summary(scan_id: int, session: Session = Depends(get_session)):
    """Get a summary of scan results."""
    summary = ScanService.get_scan_summary(session, scan_id)
    if "success" in summary and not summary["success"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=summary["message"])
    return summary


@router.delete("/scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan(scan_id: int, session: Session = Depends(get_session)):
    """Delete a scan."""
    success = ScanService.delete_scan(session, scan_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    return None


#==============================================
# Scan Schedule routes
#==============================================


# Scan Schedule routes
@router.post("/schedules", response_model=ScanScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_scan_schedule(
    schedule: ScanScheduleCreate,
    session: Session = Depends(get_session)
):
    """Create a new scan schedule."""
    try:
        db_schedule = ScanSchedulerService.create_scan_schedule(
            session=session,
            name=schedule.name,
            data_source_id=schedule.data_source_id,
            scan_rule_set_id=schedule.scan_rule_set_id,
            cron_expression=schedule.cron_expression,
            description=schedule.description,
            enabled=schedule.enabled
        )
        
        return db_schedule
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating scan schedule: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/schedules", response_model=List[ScanScheduleResponse])
async def get_scan_schedules(
    enabled: Optional[bool] = Query(None),
    session: Session = Depends(get_session)
):
    """Get all scan schedules, optionally filtered by enabled status."""
    if enabled is not None and enabled:
        return ScanSchedulerService.get_enabled_schedules(session)
    return ScanSchedulerService.get_all_schedules(session)


@router.get("/schedules/{schedule_id}", response_model=ScanScheduleResponse)
async def get_scan_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """Get a scan schedule by ID."""
    schedule = ScanSchedulerService.get_scan_schedule(session, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
    return schedule


@router.put("/schedules/{schedule_id}", response_model=ScanScheduleResponse)
async def update_scan_schedule(
    schedule_id: int,
    schedule: ScanScheduleUpdate,
    session: Session = Depends(get_session)
):
    """Update a scan schedule."""
    try:
        # Convert to dict and remove None values
        update_data = schedule.dict(exclude_unset=True)
        
        updated_schedule = ScanSchedulerService.update_scan_schedule(
            session=session,
            schedule_id=schedule_id,
            **update_data
        )
        
        if not updated_schedule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
        
        return updated_schedule
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating scan schedule: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/schedules/{schedule_id}/enable", response_model=ScanScheduleResponse)
async def enable_scan_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """Enable a scan schedule."""
    schedule = ScanSchedulerService.enable_scan_schedule(session, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
    return schedule


@router.post("/schedules/{schedule_id}/disable", response_model=ScanScheduleResponse)
async def disable_scan_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """Disable a scan schedule."""
    schedule = ScanSchedulerService.disable_scan_schedule(session, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
    return schedule


@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """Delete a scan schedule."""
    success = ScanSchedulerService.delete_scan_schedule(session, schedule_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
    return None


# ============================================================================
# NEW: Additional API endpoints for enhanced functionality
# ============================================================================

# Performance Metrics Endpoints
@router.get("/data-sources/{data_source_id}/performance-metrics")
async def get_performance_metrics(
    data_source_id: int,
    time_range: str = Query("24h", description="Time range for metrics"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get performance metrics for a data source"""
    try:
        from app.services.performance_service import PerformanceService
        
        # Get performance metrics from database
        metrics = PerformanceService.get_performance_metrics(session, data_source_id, time_range)
        
        # Convert to expected format for frontend compatibility
        formatted_metrics = {
            "overall_score": metrics.overall_score,
            "metrics": [
                {
                    "type": metric.metric_type.value,
                    "value": metric.value,
                    "unit": metric.unit,
                    "trend": metric.trend,
                    "threshold": metric.threshold,
                    "status": metric.status.value,
                    "change_percentage": metric.change_percentage,
                    "measurement_time": metric.measurement_time.isoformat()
                }
                for metric in metrics.metrics
            ],
            "alerts": [
                {
                    "id": alert.id,
                    "type": alert.alert_type,
                    "severity": alert.severity,
                    "title": alert.title,
                    "description": alert.description,
                    "status": alert.status,
                    "created_at": alert.created_at.isoformat()
                }
                for alert in metrics.alerts
            ],
            "trends": metrics.trends,
            "recommendations": metrics.recommendations
        }
        
        return {
            "success": True,
            "data": formatted_metrics,
            "data_source_id": data_source_id,
            "time_range": time_range
        }
    except Exception as e:
        logger.error(f"Error getting performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get performance metrics")


# Security Audit Endpoints
@router.get("/data-sources/{data_source_id}/security-audit")
async def get_security_audit(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get security audit data for a data source"""
    try:
        from app.services.security_service import SecurityService
        
        # Get security audit from database
        security_audit = SecurityService.get_security_audit(session, data_source_id)
        
        # Convert to expected format for frontend compatibility
        security_data = {
            "security_score": security_audit.security_score,
            "last_scan": security_audit.last_scan.isoformat() if security_audit.last_scan else None,
            "vulnerabilities": [
                {
                    "id": vuln.id,
                    "name": vuln.name,
                    "description": vuln.description,
                    "category": vuln.category,
                    "severity": vuln.severity.value,
                    "status": vuln.status.value,
                    "cve_id": vuln.cve_id,
                    "cvss_score": vuln.cvss_score,
                    "discovered_at": vuln.discovered_at.isoformat(),
                    "last_updated": vuln.last_updated.isoformat(),
                    "remediation": vuln.remediation,
                    "affected_components": vuln.affected_components,
                    "assigned_to": vuln.assigned_to,
                    "resolved_at": vuln.resolved_at.isoformat() if vuln.resolved_at else None
                }
                for vuln in security_audit.vulnerabilities
            ],
            "controls": [
                {
                    "id": control.id,
                    "name": control.name,
                    "description": control.description,
                    "category": control.category,
                    "framework": control.framework,
                    "control_id": control.control_id,
                    "status": control.status.value,
                    "compliance_status": control.compliance_status,
                    "implementation_notes": control.implementation_notes,
                    "last_assessed": control.last_assessed.isoformat() if control.last_assessed else None,
                    "next_assessment": control.next_assessment.isoformat() if control.next_assessment else None,
                    "assessor": control.assessor
                }
                for control in security_audit.controls
            ],
            "recent_scans": [
                {
                    "id": scan.id,
                    "scan_type": scan.scan_type,
                    "scan_tool": scan.scan_tool,
                    "status": scan.status,
                    "vulnerabilities_found": scan.vulnerabilities_found,
                    "critical_count": scan.critical_count,
                    "high_count": scan.high_count,
                    "medium_count": scan.medium_count,
                    "low_count": scan.low_count,
                    "started_at": scan.started_at.isoformat() if scan.started_at else None,
                    "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
                    "duration_seconds": scan.duration_seconds
                }
                for scan in security_audit.recent_scans
            ],
            "incidents": [
                {
                    "id": incident.id,
                    "title": incident.title,
                    "description": incident.description,
                    "severity": incident.severity.value,
                    "category": incident.category,
                    "status": incident.status,
                    "assigned_to": incident.assigned_to,
                    "reporter": incident.reporter,
                    "occurred_at": incident.occurred_at.isoformat(),
                    "detected_at": incident.detected_at.isoformat() if incident.detected_at else None,
                    "resolved_at": incident.resolved_at.isoformat() if incident.resolved_at else None,
                    "impact_assessment": incident.impact_assessment,
                    "affected_systems": incident.affected_systems,
                    "response_actions": incident.response_actions
                }
                for incident in security_audit.incidents
            ],
            "recommendations": security_audit.recommendations,
            "compliance_frameworks": security_audit.compliance_frameworks
        }
        
        return {
            "success": True,
            "data": security_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting security audit: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get security audit")


# Compliance Status Endpoints
@router.get("/data-sources/{data_source_id}/compliance-status")
async def get_compliance_status(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get compliance status for a data source"""
    try:
        from app.services.compliance_service import ComplianceService
        
        # Get compliance status from database
        compliance_status = ComplianceService.get_compliance_status(session, data_source_id)
        
        # Convert to expected format for frontend compatibility
        compliance_data = {
            "overall_score": compliance_status.overall_score,
            "last_assessment": compliance_status.recent_assessments[0].completed_date.isoformat() if compliance_status.recent_assessments else None,
            "frameworks": {
                framework["name"]: {
                    "score": framework["compliance_percentage"],
                    "status": "compliant" if framework["compliance_percentage"] >= 80 else "partial" if framework["compliance_percentage"] >= 60 else "non_compliant",
                    "last_checked": framework["last_assessment"].isoformat() if framework["last_assessment"] else None,
                    "next_check": compliance_status.next_assessment_due.isoformat() if compliance_status.next_assessment_due else None,
                    "total_requirements": framework["total_requirements"],
                    "compliant": framework["compliant"],
                    "non_compliant": framework["non_compliant"],
                    "partially_compliant": framework["partially_compliant"],
                    "not_assessed": framework["not_assessed"]
                }
                for framework in compliance_status.frameworks
            },
            "requirements": [
                {
                    "id": req.id,
                    "framework": req.framework.value,
                    "requirement_id": req.requirement_id,
                    "title": req.title,
                    "description": req.description,
                    "category": req.category,
                    "status": req.status.value,
                    "compliance_percentage": req.compliance_percentage,
                    "last_assessed": req.last_assessed.isoformat() if req.last_assessed else None,
                    "next_assessment": req.next_assessment.isoformat() if req.next_assessment else None,
                    "risk_level": req.risk_level,
                    "remediation_plan": req.remediation_plan,
                    "remediation_deadline": req.remediation_deadline.isoformat() if req.remediation_deadline else None,
                    "remediation_owner": req.remediation_owner
                }
                for req in compliance_status.requirements
            ],
            "gaps": [
                {
                    "id": gap.id,
                    "gap_title": gap.gap_title,
                    "gap_description": gap.gap_description,
                    "severity": gap.severity,
                    "status": gap.status,
                    "remediation_plan": gap.remediation_plan,
                    "assigned_to": gap.assigned_to,
                    "due_date": gap.due_date.isoformat() if gap.due_date else None,
                    "progress_percentage": gap.progress_percentage
                }
                for gap in compliance_status.gaps
            ],
            "recent_assessments": [
                {
                    "id": assessment.id,
                    "framework": assessment.framework.value,
                    "title": assessment.title,
                    "status": assessment.status.value,
                    "overall_score": assessment.overall_score,
                    "completed_date": assessment.completed_date.isoformat() if assessment.completed_date else None,
                    "assessor": assessment.assessor
                }
                for assessment in compliance_status.recent_assessments
            ],
            "recommendations": compliance_status.recommendations,
            "next_assessment_due": compliance_status.next_assessment_due.isoformat() if compliance_status.next_assessment_due else None,
            "data_classification": {
                "public": 25,
                "internal": 40,
                "confidential": 30,
                "restricted": 15
            },
            "retention_policies": {
                "compliant": 85,
                "non_compliant": 15
            }
        }
        
        return {
            "success": True,
            "data": compliance_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting compliance status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get compliance status")


# Backup Status Endpoints
@router.get("/data-sources/{data_source_id}/backup-status")
async def get_backup_status(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get backup status for a data source"""
    try:
        from app.services.backup_service import BackupService
        
        # Get backup operations from database
        # Use available APIs on BackupService
        backups = BackupService.get_recent_backups(session, data_source_id, limit=20)
        stats = BackupService.get_backup_stats(session, data_source_id)
        
        backup_data = {
            "backups": [
                {
                    "id": f"backup-{backup.id}",
                    "name": backup.operation_name or f"{backup.backup_type.title()} Backup",
                    "size": f"{backup.backup_size_gb:.2f}GB" if backup.backup_size_gb else "Unknown",
                    "status": backup.status,
                    "created_at": backup.started_at.isoformat(),
                    "type": backup.backup_type,
                    "retention_days": backup.retention_days,
                    "location": backup.storage_location or "Default"
                }
                for backup in backups[:10]  # Latest 10 backups
            ],
            "last_backup": backups[0].started_at.isoformat() if backups else None,
            "next_backup": None,  # TODO: Calculate based on schedule
            "backup_enabled": True,
            "retention_policy": {
                "full_backups": 30,
                "incremental_backups": 7
            },
            "stats": {
                "total_backups": stats.total_backups,
                "successful_backups": stats.successful_backups,
                "failed_backups": stats.failed_backups,
                "total_size_gb": stats.total_size_gb
            }
        }
        
        return {
            "success": True,
            "data": backup_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting backup status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get backup status")


# Scheduled Tasks Endpoints
@router.get("/data-sources/{data_source_id}/scheduled-tasks")
async def get_scheduled_tasks(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get scheduled tasks for a data source"""
    try:
        from app.services.task_service import TaskService
        
        # Get scheduled tasks from database
        # Fetch all tasks and filter by data_source_id for now
        tasks = TaskService.get_tasks(session)
        if isinstance(tasks, list) and data_source_id is not None:
            try:
                tasks = [t for t in tasks if getattr(t, 'data_source_id', getattr(t, 'data_source_id', None)) == data_source_id]
            except Exception:
                pass
        
        tasks_data = {
            "tasks": [
                {
                    "id": f"task-{task.id}",
                    "name": task.name,
                    "description": task.description,
                    "type": task.task_type,
                    "schedule": task.cron_expression,
                    "status": task.status,
                    "last_run": task.last_run.isoformat() if task.last_run else None,
                    "next_run": task.next_run.isoformat() if task.next_run else None,
                    "cron_expression": task.cron_expression,
                    "enabled": task.is_enabled,
                    "retry_count": task.retry_count,
                    "max_retries": task.max_retries,
                    "timeout_minutes": task.timeout_minutes,
                    "created_by": task.created_by,
                    "created_at": task.created_at.isoformat()
                }
                for task in tasks
            ]
        }
        
        return {
            "success": True,
            "data": tasks_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting scheduled tasks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get scheduled tasks")


# Access Control Endpoints
@router.get("/data-sources/{data_source_id}/access-control")
async def get_access_control(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get access control information for a data source"""
    try:
        from app.services.access_control_service import AccessControlService
        
        # Get permissions from database
        permissions = AccessControlService.get_permissions_by_data_source(session, data_source_id)
        
        access_data = {
            "permissions": [
                {
                    "id": f"perm-{permission.id}",
                    "user_id": permission.user_id,
                    "role_id": permission.role_id,
                    "permission_type": permission.permission_type,
                    "access_level": permission.access_level,
                    "granted_at": permission.granted_at.isoformat(),
                    "granted_by": permission.granted_by,
                    "expires_at": permission.expires_at.isoformat() if permission.expires_at else None,
                    "conditions": permission.conditions,
                    "status": "active" if not permission.expires_at or permission.expires_at > datetime.now() else "expired"
                }
                for permission in permissions
            ]
        }
        
        return {
            "success": True,
            "data": access_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting access control: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get access control")


# Notifications Endpoints
@router.get("/notifications")
async def get_notifications(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get notifications for the current user"""
    try:
        from app.services.notification_service import NotificationService
        
        # Get user ID from current user
        user_id = current_user.get("user_id", "unknown")
        
        # Create notification service instance and get notifications from database
        notification_service = NotificationService()
        notifications = await notification_service.get_notifications_by_user(session, user_id)
        
        notifications_data = {
            "notifications": [
                {
                    "id": f"notif-{notification.id}",
                    "title": notification.title,
                    "message": notification.message,
                    "type": notification.notification_type,
                    "priority": notification.priority,
                    "created_at": notification.created_at.isoformat(),
                    "read": notification.read_at is not None,
                    "read_at": notification.read_at.isoformat() if notification.read_at else None,
                    "category": notification.category,
                    "channel": notification.channel,
                    "status": notification.status,
                    "data_source_id": notification.data_source_id
                }
                for notification in notifications
            ]
        }
        
        return {
            "success": True,
            "data": notifications_data
        }
    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get notifications")


# General Tasks Endpoints
@router.get("/tasks")
async def get_tasks(
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW)),
    session: Session = Depends(get_session),
    status: Optional[str] = Query(None, description="Filter by task status"),
    type: Optional[str] = Query(None, description="Filter by task type"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    limit: int = Query(50, ge=1, le=100, description="Number of tasks to return"),
    offset: int = Query(0, ge=0, description="Number of tasks to skip")
):
    """Get scheduled tasks and background jobs with real TaskService integration."""
    try:
        from app.services.task_service import TaskService
        from app.models.task_models import TaskStatus, TaskType
        
        # Convert string filters to enum values
        status_filter = None
        if status:
            try:
                status_filter = TaskStatus(status)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        type_filter = None
        if type:
            try:
                type_filter = TaskType(type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid type: {type}")
        
        # Get tasks using the real TaskService
        tasks = TaskService.get_tasks(session, data_source_id)
        
        # Apply filters
        if status_filter:
            tasks = [task for task in tasks if task.status == status_filter]
        if type_filter:
            tasks = [task for task in tasks if task.task_type == type_filter]
        
        # Apply pagination
        total_count = len(tasks)
        paginated_tasks = tasks[offset:offset + limit]
        
        return {
            "tasks": [task.model_dump() for task in paginated_tasks],
            "total": total_count,
            "page": (offset // limit) + 1,
            "limit": limit,
            "has_more": (offset + limit) < total_count
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tasks: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/tasks/stats")
async def get_task_stats(
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW)),
    session: Session = Depends(get_session)
):
    """Get task statistics using real TaskService."""
    try:
        from app.services.task_service import TaskService
        from app.models.task_models import TaskStatus
        from datetime import datetime, timedelta
        from sqlmodel import select
        
        # Get comprehensive task statistics using the real service
        stats = TaskService.get_task_stats(session)
        
        # Calculate additional 24-hour metrics
        yesterday = datetime.now() - timedelta(days=1)
        
        # Get recent executions for 24-hour stats
        from app.models.task_models import TaskExecution
        
        recent_executions = session.execute(
            select(TaskExecution).where(TaskExecution.started_at >= yesterday)
        ).all()
        
        completed_24h = len([e for e in recent_executions if e.status == TaskStatus.COMPLETED])
        failed_24h = len([e for e in recent_executions if e.status == TaskStatus.FAILED])
        success_rate_24h = (completed_24h / (completed_24h + failed_24h)) * 100 if (completed_24h + failed_24h) > 0 else 100.0
        
        return {
            "total_tasks": stats.total_tasks,
            "enabled_tasks": stats.enabled_tasks,
            "disabled_tasks": stats.disabled_tasks,
            "running_tasks": stats.running_tasks,
            "completed_tasks": stats.successful_executions,
            "failed_tasks": stats.failed_executions,
            "success_rate": stats.success_rate_percentage,
            "average_duration": stats.avg_execution_time_minutes,
            "next_scheduled_task": stats.next_scheduled_task,
            "task_types_distribution": stats.task_types_distribution,
            "last_24_hours": {
                "completed": completed_24h,
                "failed": failed_24h,
                "success_rate": round(success_rate_24h, 1)
            }
        }
    except Exception as e:
        logger.error(f"Error getting task stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Health System Endpoint
@router.get("/health/system")
async def get_system_health(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get system health status for scanning operations
    
    Features:
    - System health monitoring
    - Service status checks
    - Performance metrics
    - Resource utilization
    """
    try:
        from app.services.performance_service import PerformanceService
        from app.services.scan_service import ScanService
        
        # Get system health metrics
        performance_service = PerformanceService()
        system_metrics = performance_service.get_comprehensive_system_metrics(session)
        
        # Get scan service health
        scan_service = ScanService()
        scan_health = scan_service.get_service_health(session)
        
        # Get database health
        try:
            from sqlalchemy import text
            session.execute(text("SELECT 1"))
            db_status = "healthy"
        except Exception:
            db_status = "unhealthy"
        
        return {
            "success": True,
            "data": {
                "system_health": system_metrics.get("system_health", {}),
                "scan_service": scan_health,
                "database": {
                    "status": db_status,
                    "connection": "active" if db_status == "healthy" else "failed"
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system health: {str(e)}"
        )


# General Reports Endpoints
@router.get("/reports")
async def get_all_reports(
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW)),
    session: Session = Depends(get_session),
    status: Optional[str] = Query(None, description="Filter by report status"),
    type: Optional[str] = Query(None, description="Filter by report type"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    limit: int = Query(50, ge=1, le=100, description="Number of reports to return"),
    offset: int = Query(0, ge=0, description="Number of reports to skip")
):
    """Get all reports with filtering and pagination using real ReportService."""
    try:
        from app.services.report_service import ReportService
        from app.models.report_models import ReportStatus, ReportType
        from sqlmodel import select
        from app.models.report_models import Report
        
        # Build query
        query = select(Report)
        
        # Apply filters
        if status:
            try:
                status_filter = ReportStatus(status)
                query = query.where(Report.status == status_filter)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        if type:
            try:
                type_filter = ReportType(type)
                query = query.where(Report.report_type == type_filter)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid type: {type}")
        
        if data_source_id:
            query = query.where(Report.data_source_id == data_source_id)
        
        # Get total count
        total_count = len(session.execute(query).scalars().all())
        
        # Apply pagination
        query = query.order_by(Report.created_at.desc()).offset(offset).limit(limit)
        reports = session.execute(query).scalars().all()
        
        # Convert to response format
        reports_data = []
        for report in reports:
            reports_data.append({
                "id": report.id,
                "name": report.name,
                "description": report.description,
                "report_type": report.report_type,
                "format": report.format,
                "status": report.status,
                "data_source_id": report.data_source_id,
                "is_scheduled": report.is_scheduled,
                "schedule_cron": report.schedule_cron,
                "generated_by": report.generated_by,
                "generated_at": report.generated_at.isoformat() if report.generated_at else None,
                "created_at": report.created_at.isoformat(),
                "updated_at": report.updated_at.isoformat(),
                "file_path": report.file_path,
                "file_size": report.file_size
            })
        
        return {
            "reports": reports_data,
            "total": total_count,
            "page": (offset // limit) + 1,
            "limit": limit,
            "has_more": (offset + limit) < total_count
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/reports/stats")
async def get_report_stats(
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW)),
    session: Session = Depends(get_session)
):
    """Get report statistics using real ReportService."""
    try:
        from app.services.report_service import ReportService
        
        # Get comprehensive report statistics using the real service
        stats = ReportService.get_report_stats(session)
        
        return {
            "total_reports": stats.total_reports,
            "completed_reports": stats.completed_reports,
            "failed_reports": stats.failed_reports,
            "pending_reports": stats.pending_reports,
            "scheduled_reports": stats.scheduled_reports,
            "total_size_mb": stats.total_size_mb,
            "avg_generation_time_minutes": stats.avg_generation_time_minutes,
            "most_used_type": stats.most_used_type,
            "success_rate_percentage": stats.success_rate_percentage
        }
    except Exception as e:
        logger.error(f"Error getting report stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Reports Endpoints
@router.get("/data-sources/{data_source_id}/reports")
async def get_reports(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get reports for a data source"""
    try:
        from app.services.report_service import ReportService
        
        # Get reports from database
        reports = ReportService.get_reports_by_data_source(session, data_source_id)
        
        reports_data = {
            "reports": [
                {
                    "id": f"report-{report.id}",
                    "name": report.name,
                    "type": report.report_type,
                    "status": report.status,
                    "created_at": report.created_at.isoformat(),
                    "generated_at": report.generated_at.isoformat() if report.generated_at else None,
                    "size": f"{report.file_size / (1024*1024):.1f}MB" if report.file_size else "Unknown",
                    "format": report.format,
                    "description": report.description,
                    "generated_by": report.generated_by,
                    "is_scheduled": report.is_scheduled,
                    "file_path": report.file_path
                }
                for report in reports
            ]
        }
        
        return {
            "success": True,
            "data": reports_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get reports")


# Version History Endpoints
@router.get("/data-sources/{data_source_id}/version-history")
async def get_version_history(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get version history for a data source"""
    try:
        from app.services.version_service import VersionService
        
        # Get versions from database
        versions = VersionService.get_versions_by_data_source(session, data_source_id)
        
        version_data = {
            "versions": [
                {
                    "id": f"v-{version.id}",
                    "version": version.version,
                    "name": version.name,
                    "description": version.description,
                    "created_at": version.created_at.isoformat(),
                    "created_by": version.created_by,
                    "changes": [change.description for change in version.changes],
                    "status": version.status,
                    "is_current": version.is_current,
                    "breaking_changes": version.breaking_changes,
                    "changes_summary": version.changes_summary,
                    "activated_at": version.activated_at.isoformat() if version.activated_at else None
                }
                for version in versions
            ]
        }
        
        return {
            "success": True,
            "data": version_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting version history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get version history")


# General Versions Endpoint
@router.get("/versions/{data_source_id}")
async def get_versions(
    data_source_id: int,
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW)),
    session: Session = Depends(get_session),
    status: Optional[str] = Query(None, description="Filter by version status"),
    limit: int = Query(50, ge=1, le=100, description="Number of versions to return"),
    offset: int = Query(0, ge=0, description="Number of versions to skip")
):
    """Get all versions for a data source using real VersionService."""
    try:
        from app.services.version_service import VersionService
        from app.models.version_models import VersionStatus
        
        # Get versions using the real VersionService
        versions = VersionService.get_versions_by_data_source(session, data_source_id)
        
        # Apply status filter if provided
        if status:
            try:
                status_filter = VersionStatus(status)
                versions = [v for v in versions if v.status == status_filter]
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        # Apply pagination
        total_count = len(versions)
        paginated_versions = versions[offset:offset + limit]
        
        # Convert to response format
        versions_data = []
        for version in paginated_versions:
            version_dict = version.model_dump()
            # Convert changes to list of dicts
            if version.changes:
                version_dict["changes"] = [change.model_dump() for change in version.changes]
            else:
                version_dict["changes"] = []
            versions_data.append(version_dict)
        
        return {
            "versions": versions_data,
            "total": total_count,
            "page": (offset // limit) + 1,
            "limit": limit,
            "has_more": (offset + limit) < total_count,
            "data_source_id": data_source_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting versions for data source {data_source_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Tags Management Endpoints
@router.get("/data-sources/{data_source_id}/tags")
async def get_data_source_tags(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get tags for a data source"""
    try:
        from app.services.tag_service import TagService
        
        # Get tags from database
        tag_associations = TagService.get_data_source_tags(session, data_source_id)
        
        tags_data = {
            "tags": [
                {
                    "id": f"tag-{association.tag.id}",
                    "name": association.tag.name,
                    "display_name": association.tag.display_name,
                    "color": association.tag.color,
                    "description": association.tag.description,
                    "tag_type": association.tag.tag_type,
                    "scope": association.tag.scope,
                    "assigned_at": association.assigned_at.isoformat(),
                    "assigned_by": association.assigned_by,
                    "context": association.context,
                    "auto_assigned": association.auto_assigned,
                    "created_at": association.tag.created_at.isoformat()
                }
                for association in tag_associations
            ]
        }
        
        return {
            "success": True,
            "data": tags_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting tags: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get tags")


# Integrations Endpoints
@router.get("/data-sources/{data_source_id}/integrations")
async def get_data_source_integrations(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get integrations for a data source"""
    try:
        from app.services.integration_service import IntegrationService
        
        # Get integrations from database
        integrations = IntegrationService.get_integrations_by_data_source(session, data_source_id)
        
        # Convert to response format
        integrations_data = {
            "integrations": [
                {
                    "id": str(integration.id),
                    "name": integration.name,
                    "type": integration.type,
                    "provider": integration.provider,
                    "status": integration.status,
                    "description": integration.description,
                    "lastSync": integration.last_sync.isoformat() if integration.last_sync else None,
                    "nextSync": integration.next_sync.isoformat() if integration.next_sync else None,
                    "syncFrequency": integration.sync_frequency,
                    "successRate": integration.success_rate,
                    "dataVolume": integration.data_volume,
                    "errorCount": integration.error_count,
                    "createdAt": integration.created_at.isoformat()
                }
                for integration in integrations
            ]
        }
        
        return {
            "success": True,
            "data": integrations_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting integrations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get integrations")


# Catalog Endpoints
@router.get("/data-sources/{data_source_id}/catalog")
async def get_data_source_catalog(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get catalog data for a data source with enhanced real-time integration"""
    try:
        from app.services.catalog_service import EnhancedCatalogService
        
        # Get catalog items from database using enhanced service
        catalog_items = EnhancedCatalogService.get_catalog_items_by_data_source(session, data_source_id)
        
        catalog_data = {
            "catalog": [
                {
                    "id": f"cat-{item.id}",
                    "name": item.table_name,
                    "display_name": item.display_name,
                    "type": item.item_type,
                    "schema": item.schema_name,
                    "description": item.description,
                    "classification": item.classification,
                    "sensitivity_level": item.sensitivity_level,
                    "data_type": item.data_type,
                    "business_glossary": item.business_glossary,
                    "lastUpdated": item.updated_at.isoformat(),
                    "created_by": item.created_by,
                    "created_at": item.created_at.isoformat(),
                    "is_active": item.is_active,
                    "metadata": item.metadata
                }
                for item in catalog_items
            ]
        }
        
        return {
            "success": True,
            "data": catalog_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting catalog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get catalog")


@router.get("/integrations")
async def get_integrations(
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW)),
    session: Session = Depends(get_session),
    status: Optional[str] = Query(None, description="Filter by integration status"),
    type: Optional[str] = Query(None, description="Filter by integration type"),
    provider: Optional[str] = Query(None, description="Filter by provider"),
    limit: int = Query(50, ge=1, le=100, description="Number of integrations to return"),
    offset: int = Query(0, ge=0, description="Number of integrations to skip")
):
    """Get all integrations with filtering and pagination."""
    try:
        from app.services.integration_service import IntegrationService
        from app.models.integration_models import IntegrationStatus, IntegrationType
        
        # Convert string filters to enum values
        status_filter = None
        if status:
            try:
                status_filter = IntegrationStatus(status)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        type_filter = None
        if type:
            try:
                type_filter = IntegrationType(type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid type: {type}")
        
        # Get integrations using the service
        result = IntegrationService.get_all_integrations(
            session=session,
            user_id=current_user.get("user_id"),
            status=status_filter,
            type=type_filter,
            provider=provider,
            limit=limit,
            offset=offset
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting integrations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/catalog")
async def get_data_catalog(
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW)),
    session: Session = Depends(get_session)
):
    """Get general data catalog overview"""
    try:
        from app.services.catalog_service import EnhancedCatalogService
        
        # Get all catalog items
        catalog_items = EnhancedCatalogService.get_all_catalog_items(session)
        
        catalog_data = {
            "catalog": [
                {
                    "id": item.id,
                    "name": item.name,
                    "type": item.type,
                    "description": item.description,
                    "metadata": item.metadata,
                    "tags": [tag.name for tag in item.tags] if item.tags else [],
                    "data_source_id": item.data_source_id,
                    "created_at": item.created_at.isoformat() if item.created_at else None,
                    "updated_at": item.updated_at.isoformat() if item.updated_at else None
                }
                for item in catalog_items
            ],
            "total_count": len(catalog_items),
            "catalog_summary": {
                "total_items": len(catalog_items),
                "by_type": {},
                "by_data_source": {}
            }
        }
        
        # Generate summary statistics
        for item in catalog_items:
            # Count by type
            item_type = item.type.value if hasattr(item.type, 'value') else str(item.type)
            catalog_data["catalog_summary"]["by_type"][item_type] = catalog_data["catalog_summary"]["by_type"].get(item_type, 0) + 1
            
            # Count by data source
            if item.data_source_id:
                catalog_data["catalog_summary"]["by_data_source"][str(item.data_source_id)] = catalog_data["catalog_summary"]["by_data_source"].get(str(item.data_source_id), 0) + 1
        
        return {
            "success": True,
            "data": catalog_data,
        }
    except Exception as e:
        logger.error(f"Error getting data catalog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get data catalog")

