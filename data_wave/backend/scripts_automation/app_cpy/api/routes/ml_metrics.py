from fastapi import APIRouter, HTTPException
import os
import json

router = APIRouter()

METRICS_PATH = "app/api/classifiers/ml_models/metrics.json"

@router.get("/ml/metrics")
def get_model_metrics():
    if not os.path.exists(METRICS_PATH):
        raise HTTPException(status_code=404, detail="Fichier metrics.json non trouvé.")

    try:
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
        return {"model": "hybrid_classifier", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lecture métriques: {str(e)}")
