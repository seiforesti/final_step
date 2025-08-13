# app/api/routes/ml.py
from fastapi import APIRouter, HTTPException
import os
import json
import pandas as pd
from app.api.classifiers.hybrid_classifier import HybridClassifier
from train_hybrid_model import train_and_save  # ✅ Import correct maintenant

router = APIRouter()

METRICS_PATH = "app/api/classifiers/ml_models/metrics.json"
TRAINING_DATA_PATH = "app/api/classifiers/ml_models/data/training_data.csv"

@router.get("/ml/metrics")
def get_ml_metrics():
    if not os.path.exists(METRICS_PATH):
        raise HTTPException(status_code=404, detail="Fichier metrics.json non trouvé")
    with open(METRICS_PATH) as f:
        return json.load(f)

@router.post("/ml/retrain")
def retrain_model():
    try:
        result = train_and_save()
        return {"message": "✅ Modèle réentraîné avec succès", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ml/categories")
def get_training_categories():
    if not os.path.exists(TRAINING_DATA_PATH):
        raise HTTPException(status_code=404, detail="Fichier training_data.csv non trouvé")
    df = pd.read_csv(TRAINING_DATA_PATH)
    if 'category' not in df.columns:
        raise HTTPException(status_code=400, detail="Colonne 'category' manquante dans le CSV")
    stats = df['category'].value_counts().to_dict()
    return stats
