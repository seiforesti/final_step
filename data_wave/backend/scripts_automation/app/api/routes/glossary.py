### === backend/app/api/routes/glossary.py ===
from fastapi import APIRouter, Body, Depends
from typing import Dict, Any
from app.services.glossary import create_glossary_terms
from app.api.security import require_permission
from app.api.security.rbac import PERMISSION_DASHBOARD_VIEW

router = APIRouter()

@router.post("/")
def add_glossary_terms(payload: dict = Body(...), current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DASHBOARD_VIEW))):
    return create_glossary_terms(payload)
