from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session

from app.db_session import get_session
from app.services.data_profiling_service import DataProfilingService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_DATA_PROFILING_VIEW, PERMISSION_DATA_PROFILING_RUN
)

router = APIRouter(prefix="/data-profiling", tags=["data-profiling"])

@router.post("/sample")
async def sample_data(
    data_source_id: int = Query(..., description="ID of the data source"),
    schema_name: Optional[str] = Query(None, description="Schema name for relational databases"),
    table_name: str = Query(..., description="Table name for relational databases or collection name for MongoDB"),
    sample_size: int = Query(1000, description="Number of rows to sample"),
    sample_method: str = Query("random", description="Sampling method: random, first, or stratified"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DATA_PROFILING_RUN))
) -> Dict[str, Any]:
    """Sample data from a data source."""
    try:
        service = DataProfilingService(session)
        return service.sample_data(
            data_source_id=data_source_id,
            schema_name=schema_name,
            table_name=table_name,
            sample_size=sample_size,
            sample_method=sample_method
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sampling data: {str(e)}")

@router.post("/profile")
async def profile_data(
    data_source_id: int = Query(..., description="ID of the data source"),
    schema_name: Optional[str] = Query(None, description="Schema name for relational databases"),
    table_name: str = Query(..., description="Table name for relational databases or collection name for MongoDB"),
    sample_size: int = Query(1000, description="Number of rows to sample for profiling"),
    include_correlations: bool = Query(False, description="Whether to include correlation analysis"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DATA_PROFILING_RUN))
) -> Dict[str, Any]:
    """Profile data from a data source."""
    try:
        service = DataProfilingService(session)
        return service.profile_data(
            data_source_id=data_source_id,
            schema_name=schema_name,
            table_name=table_name,
            sample_size=sample_size,
            include_correlations=include_correlations
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error profiling data: {str(e)}")

@router.post("/detect-patterns")
async def detect_data_patterns(
    data_source_id: int = Query(..., description="ID of the data source"),
    schema_name: Optional[str] = Query(None, description="Schema name for relational databases"),
    table_name: str = Query(..., description="Table name for relational databases or collection name for MongoDB"),
    sample_size: int = Query(1000, description="Number of rows to sample for pattern detection"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DATA_PROFILING_RUN))
) -> Dict[str, Any]:
    """Detect patterns in data from a data source."""
    try:
        service = DataProfilingService(session)
        return service.detect_data_patterns(
            data_source_id=data_source_id,
            schema_name=schema_name,
            table_name=table_name,
            sample_size=sample_size
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting data patterns: {str(e)}")

@router.post("/analyze-quality")
async def analyze_data_quality(
    data_source_id: int = Query(..., description="ID of the data source"),
    schema_name: Optional[str] = Query(None, description="Schema name for relational databases"),
    table_name: str = Query(..., description="Table name for relational databases or collection name for MongoDB"),
    sample_size: int = Query(1000, description="Number of rows to sample for quality analysis"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DATA_PROFILING_RUN))
) -> Dict[str, Any]:
    """Analyze data quality from a data source."""
    try:
        service = DataProfilingService(session)
        return service.analyze_data_quality(
            data_source_id=data_source_id,
            schema_name=schema_name,
            table_name=table_name,
            sample_size=sample_size
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing data quality: {str(e)}")