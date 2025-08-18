"""
ml_suggestion_engine.py
Advanced, pluggable ML-driven label suggestion engine with fallback and explainability.
"""

import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sensitivity_labeling.suggestion_engine import rules_based_suggestion

class MLSuggestionEngine:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.confidence_threshold = 0.7  # configurable
        self.is_trained = False

    def train(self, X: np.ndarray, y: List[str]):
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)
        self.model = RandomForestClassifier(n_estimators=100)
        self.model.fit(X, y_encoded)
        self.is_trained = True

    def predict(self, features: np.ndarray) -> Dict[str, Any]:
        if not self.is_trained:
            return {"suggestion": None, "confidence": 0.0, "fallback": True, "explanation": "ML model not trained"}
        proba = self.model.predict_proba([features])[0]
        idx = np.argmax(proba)
        confidence = proba[idx]
        label = self.label_encoder.inverse_transform([idx])[0]
        explanation = self._feature_importance()
        fallback = confidence < self.confidence_threshold
        return {
            "suggestion": label,
            "confidence": float(confidence),
            "fallback": fallback,
            "explanation": explanation if not fallback else "Low confidence, fallback to rules-based"
        }

    def _feature_importance(self) -> Dict[str, float]:
        if self.model is None:
            return {}
        return {f"feature_{i}": float(imp) for i, imp in enumerate(self.model.feature_importances_)}

    def retrain(self, X: np.ndarray, y: List[str]):
        self.train(X, y)

ml_suggestion_engine = MLSuggestionEngine()

def get_ml_suggestion(features: np.ndarray) -> Dict[str, Any]:
    result = ml_suggestion_engine.predict(features)
    if result["fallback"]:
        # Fallback to rules-based
        rules_result = rules_based_suggestion(features)
        result["rules_based"] = rules_result
    return result
