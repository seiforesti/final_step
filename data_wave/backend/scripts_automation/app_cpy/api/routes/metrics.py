from fastapi import APIRouter, HTTPException, Depends
import os
import json
from typing import Dict, Any

from app.api.security import require_permission
from app.api.security.rbac import PERMISSION_DASHBOARD_VIEW

router = APIRouter()

@router.get("/metrics/hybrid-ml")
def get_hybrid_metrics(current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DASHBOARD_VIEW))):
    metrics_path = os.path.join("app", "api", "classifiers", "ml_models", "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Métriques non trouvées")

    try:
        with open(metrics_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {
            "model": "HybridClassifier (ML)",
            "metrics": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))