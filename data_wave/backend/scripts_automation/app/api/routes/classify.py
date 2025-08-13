from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any
from app.services.data_sensitivity_service import update_all_columns_data_sensitivity
from app.db_session import get_session
from app.services.classification_service import classify_and_assign_sensitivity
from app.models.schema_models import DataTableSchema
from app.api.security import require_permission
from app.api.security.rbac import PERMISSION_DATA_PROFILING_RUN
import os

router = APIRouter()

@router.get("//")
def classify_schema(
    db_url: str = Query(None, description="Database connection string"),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DATA_PROFILING_RUN))
):
    if not db_url:
        db_url = os.getenv("DB_URL")
    results = []
    from app.services.extraction_service import extract_db_schema
    columns = extract_db_schema(db_url)
    with get_session() as session:
        for column in columns:
            result = classify_and_assign_sensitivity(session, column)
            results.append(result)
        session.commit()
    return results

@router.post("/update_sensitivity_labels")
def update_sensitivity_labels(current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DATA_PROFILING_RUN))):
    with get_session() as session:
        try:
            update_all_columns_data_sensitivity(session)
            return JSONResponse(content={"message": "Data sensitivity labels updated successfully."}, status_code=200)
        except Exception as e:
            return JSONResponse(content={"error": str(e)}, status_code=500)
