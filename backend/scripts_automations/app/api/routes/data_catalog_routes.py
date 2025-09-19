"""
Data Catalog API Routes

Routes for managing data sources, assets, schemas, and lineage.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import uuid

from ...core.database import get_db_session
from ...core.security import get_current_user, require_permission
from ...services.catalog_services import (
    DataSourceService,
    DataAssetService,
    SchemaDiscoveryService,
    LineageService,
    MetadataService
)
from ...models.data_catalog_models import (
    DataSourceCreate, DataSourceUpdate, DataSourceResponse,
    DataAssetCreate, DataAssetUpdate, DataAssetResponse,
    DataLineageCreate, DataLineageResponse
)
from ...models.access_control_models import User
from ...utils.responses import create_response, create_error_response
from ...utils.pagination import PaginationParams, create_paginated_response

# Data Sources Router
data_sources_router = APIRouter(prefix="/data-sources", tags=["Data Sources"])


@data_sources_router.post(
    "/",
    response_model=DataSourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Data Source",
    description="Create a new data source connection"
)
async def create_data_source(
    data_source: DataSourceCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new data source."""
    try:
        # Check permissions
        await require_permission(current_user, "data_sources:create")
        
        # Create service instance
        service = DataSourceService(db_session=db)
        
        # Create data source
        result = await service.create(data_source, created_by=current_user.id)
        
        return create_response(
            data=result,
            message="Data source created successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_sources_router.get(
    "/",
    response_model=Dict[str, Any],
    summary="List Data Sources",
    description="Get paginated list of data sources with filtering"
)
async def list_data_sources(
    pagination: PaginationParams = Depends(),
    status: Optional[str] = Query(None, description="Filter by status"),
    type: Optional[str] = Query(None, description="Filter by type"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of data sources."""
    try:
        # Check permissions
        await require_permission(current_user, "data_sources:read")
        
        # Create service instance
        service = DataSourceService(db_session=db)
        
        # Build filters
        filters = {}
        if status:
            filters["status"] = status
        if type:
            filters["type"] = type
        
        # Get data sources
        data_sources = await service.get_multi(
            skip=pagination.skip,
            limit=pagination.limit,
            filters=filters
        )
        
        # Get total count
        total = await service.count(filters)
        
        return create_paginated_response(
            data=data_sources,
            total=total,
            page=pagination.page,
            size=pagination.size
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_sources_router.get(
    "/{data_source_id}",
    response_model=DataSourceResponse,
    summary="Get Data Source",
    description="Get data source by ID"
)
async def get_data_source(
    data_source_id: uuid.UUID = Path(..., description="Data source ID"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get data source by ID."""
    try:
        # Check permissions
        await require_permission(current_user, "data_sources:read")
        
        # Create service instance
        service = DataSourceService(db_session=db)
        
        # Get data source
        data_source = await service.get(data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data source not found"
            )
        
        return create_response(data=data_source)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_sources_router.put(
    "/{data_source_id}",
    response_model=DataSourceResponse,
    summary="Update Data Source",
    description="Update data source by ID"
)
async def update_data_source(
    data_source_id: uuid.UUID = Path(..., description="Data source ID"),
    data_source_update: DataSourceUpdate = Body(...),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Update data source by ID."""
    try:
        # Check permissions
        await require_permission(current_user, "data_sources:update")
        
        # Create service instance
        service = DataSourceService(db_session=db)
        
        # Update data source
        result = await service.update(
            data_source_id,
            data_source_update,
            updated_by=current_user.id
        )
        
        return create_response(
            data=result,
            message="Data source updated successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_sources_router.delete(
    "/{data_source_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Data Source",
    description="Delete data source by ID"
)
async def delete_data_source(
    data_source_id: uuid.UUID = Path(..., description="Data source ID"),
    hard_delete: bool = Query(False, description="Perform hard delete"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Delete data source by ID."""
    try:
        # Check permissions
        await require_permission(current_user, "data_sources:delete")
        
        # Create service instance
        service = DataSourceService(db_session=db)
        
        # Delete data source
        await service.delete(
            data_source_id,
            soft_delete=not hard_delete,
            updated_by=current_user.id
        )
        
        return JSONResponse(
            status_code=status.HTTP_204_NO_CONTENT,
            content={"message": "Data source deleted successfully"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_sources_router.post(
    "/{data_source_id}/test-connection",
    summary="Test Data Source Connection",
    description="Test connection to a data source"
)
async def test_data_source_connection(
    data_source_id: uuid.UUID = Path(..., description="Data source ID"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Test connection to a data source."""
    try:
        # Check permissions
        await require_permission(current_user, "data_sources:test")
        
        # Create service instance
        service = DataSourceService(db_session=db)
        
        # Test connection
        result = await service.test_connection(data_source_id)
        
        return create_response(
            data=result,
            message="Connection test completed"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_sources_router.post(
    "/{data_source_id}/discover",
    summary="Discover Data Source Schema",
    description="Discover and catalog schema from data source"
)
async def discover_data_source_schema(
    data_source_id: uuid.UUID = Path(..., description="Data source ID"),
    full_scan: bool = Query(False, description="Perform full schema discovery"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Discover schema from data source."""
    try:
        # Check permissions
        await require_permission(current_user, "data_sources:discover")
        
        # Create service instance
        discovery_service = SchemaDiscoveryService(db_session=db)
        
        # Start discovery
        result = await discovery_service.discover_schema(
            data_source_id,
            full_scan=full_scan,
            initiated_by=current_user.id
        )
        
        return create_response(
            data=result,
            message="Schema discovery initiated"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Data Assets Router
data_assets_router = APIRouter(prefix="/data-assets", tags=["Data Assets"])


@data_assets_router.post(
    "/",
    response_model=DataAssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Data Asset",
    description="Create a new data asset"
)
async def create_data_asset(
    data_asset: DataAssetCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new data asset."""
    try:
        # Check permissions
        await require_permission(current_user, "data_assets:create")
        
        # Create service instance
        service = DataAssetService(db_session=db)
        
        # Create data asset
        result = await service.create(data_asset, created_by=current_user.id)
        
        return create_response(
            data=result,
            message="Data asset created successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_assets_router.get(
    "/",
    response_model=Dict[str, Any],
    summary="List Data Assets",
    description="Get paginated list of data assets with filtering"
)
async def list_data_assets(
    pagination: PaginationParams = Depends(),
    data_source_id: Optional[uuid.UUID] = Query(None, description="Filter by data source"),
    type: Optional[str] = Query(None, description="Filter by asset type"),
    classification: Optional[str] = Query(None, description="Filter by classification"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of data assets."""
    try:
        # Check permissions
        await require_permission(current_user, "data_assets:read")
        
        # Create service instance
        service = DataAssetService(db_session=db)
        
        # Build filters
        filters = {}
        if data_source_id:
            filters["data_source_id"] = data_source_id
        if type:
            filters["type"] = type
        if classification:
            filters["classification_level"] = classification
        
        # Get data assets
        data_assets = await service.get_multi(
            skip=pagination.skip,
            limit=pagination.limit,
            filters=filters
        )
        
        # Get total count
        total = await service.count(filters)
        
        return create_paginated_response(
            data=data_assets,
            total=total,
            page=pagination.page,
            size=pagination.size
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_assets_router.get(
    "/{asset_id}",
    response_model=DataAssetResponse,
    summary="Get Data Asset",
    description="Get data asset by ID"
)
async def get_data_asset(
    asset_id: uuid.UUID = Path(..., description="Data asset ID"),
    include_lineage: bool = Query(False, description="Include lineage information"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get data asset by ID."""
    try:
        # Check permissions
        await require_permission(current_user, "data_assets:read")
        
        # Create service instance
        service = DataAssetService(db_session=db)
        
        # Get data asset
        data_asset = await service.get(asset_id)
        if not data_asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data asset not found"
            )
        
        result = data_asset
        
        # Include lineage if requested
        if include_lineage:
            lineage_service = LineageService(db_session=db)
            lineage = await lineage_service.get_asset_lineage(asset_id)
            result.lineage = lineage
        
        return create_response(data=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_assets_router.put(
    "/{asset_id}",
    response_model=DataAssetResponse,
    summary="Update Data Asset",
    description="Update data asset by ID"
)
async def update_data_asset(
    asset_id: uuid.UUID = Path(..., description="Data asset ID"),
    asset_update: DataAssetUpdate = Body(...),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Update data asset by ID."""
    try:
        # Check permissions
        await require_permission(current_user, "data_assets:update")
        
        # Create service instance
        service = DataAssetService(db_session=db)
        
        # Update data asset
        result = await service.update(
            asset_id,
            asset_update,
            updated_by=current_user.id
        )
        
        return create_response(
            data=result,
            message="Data asset updated successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@data_assets_router.post(
    "/{asset_id}/profile",
    summary="Profile Data Asset",
    description="Generate data profile for asset"
)
async def profile_data_asset(
    asset_id: uuid.UUID = Path(..., description="Data asset ID"),
    sample_size: Optional[int] = Query(1000, description="Sample size for profiling"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Generate data profile for asset."""
    try:
        # Check permissions
        await require_permission(current_user, "data_assets:profile")
        
        # Create service instance
        service = DataAssetService(db_session=db)
        
        # Start profiling
        result = await service.profile_asset(
            asset_id,
            sample_size=sample_size,
            initiated_by=current_user.id
        )
        
        return create_response(
            data=result,
            message="Data profiling initiated"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Schemas Router
schemas_router = APIRouter(prefix="/schemas", tags=["Schemas"])


@schemas_router.get(
    "/{asset_id}/schema",
    summary="Get Asset Schema",
    description="Get schema definition for data asset"
)
async def get_asset_schema(
    asset_id: uuid.UUID = Path(..., description="Data asset ID"),
    version: Optional[str] = Query(None, description="Schema version"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get schema definition for data asset."""
    try:
        # Check permissions
        await require_permission(current_user, "schemas:read")
        
        # Create service instance
        service = SchemaDiscoveryService(db_session=db)
        
        # Get schema
        schema = await service.get_asset_schema(asset_id, version)
        
        return create_response(data=schema)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Lineage Router
lineage_router = APIRouter(prefix="/lineage", tags=["Data Lineage"])


@lineage_router.post(
    "/",
    response_model=DataLineageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Lineage Relationship",
    description="Create a new data lineage relationship"
)
async def create_lineage(
    lineage: DataLineageCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new data lineage relationship."""
    try:
        # Check permissions
        await require_permission(current_user, "lineage:create")
        
        # Create service instance
        service = LineageService(db_session=db)
        
        # Create lineage
        result = await service.create(lineage, created_by=current_user.id)
        
        return create_response(
            data=result,
            message="Lineage relationship created successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@lineage_router.get(
    "/{asset_id}",
    summary="Get Asset Lineage",
    description="Get lineage graph for data asset"
)
async def get_asset_lineage(
    asset_id: uuid.UUID = Path(..., description="Data asset ID"),
    direction: str = Query("both", description="Lineage direction: upstream, downstream, or both"),
    depth: int = Query(3, description="Maximum depth to traverse"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get lineage graph for data asset."""
    try:
        # Check permissions
        await require_permission(current_user, "lineage:read")
        
        # Create service instance
        service = LineageService(db_session=db)
        
        # Get lineage
        lineage = await service.get_asset_lineage(
            asset_id,
            direction=direction,
            max_depth=depth
        )
        
        return create_response(data=lineage)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@lineage_router.get(
    "/{asset_id}/impact-analysis",
    summary="Impact Analysis",
    description="Analyze downstream impact of changes to data asset"
)
async def analyze_impact(
    asset_id: uuid.UUID = Path(..., description="Data asset ID"),
    change_type: str = Query("schema_change", description="Type of change to analyze"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Analyze downstream impact of changes to data asset."""
    try:
        # Check permissions
        await require_permission(current_user, "lineage:analyze")
        
        # Create service instance
        service = LineageService(db_session=db)
        
        # Analyze impact
        impact = await service.analyze_impact(asset_id, change_type)
        
        return create_response(data=impact)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )