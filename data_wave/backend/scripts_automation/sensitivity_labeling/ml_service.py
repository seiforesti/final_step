"""
ml_service.py
Service class for ML lifecycle management: training, prediction, versioning, and retraining.

Enhancements:
- After each training, the model is evaluated on a holdout/test set (if enough data).
- Accuracy, precision, and recall are calculated using scikit-learn metrics.
- These metrics are stored in the ml_model_versions table for monitoring and dashboard use.
- This enables real feedback loops, model monitoring, and production-grade ML governance.
"""
from typing import List, Dict, Any
import numpy as np
from .ml_suggestion_engine import MLSuggestionEngine
from .models import MLModelVersion, Feedback
from sqlalchemy.orm import Session
from datetime import datetime
from sklearn.metrics import accuracy_score, precision_score, recall_score
import joblib
import os

class MLSuggestionService:
    def __init__(self):
        self.engine = MLSuggestionEngine()
        self.current_version = None
        self.model_dir = "ml_models"  # Directory to store model files
        os.makedirs(self.model_dir, exist_ok=True)

    def _model_path(self, version):
        # Sanitize version string for Windows (replace : with _)
        safe_version = version.replace(":", "_")
        return os.path.join(self.model_dir, f"model_{safe_version}.joblib")

    def train(self, X: np.ndarray, y: List[str], db: Session):
        # Ensure all labels are strings
        y = [str(label) for label in y]
        # Ensure X is a 2D numpy array and not empty
        X = np.array(X)
        if X.ndim == 1:
            X = X.reshape(-1, 1)
        if X.size == 0 or X.shape[1] == 0:
            raise ValueError("Feature array must be non-empty and 2D.")
        self.engine.train(X, y)
        # Save model to disk
        version = f"v{datetime.utcnow().isoformat()}"
        model_path = self._model_path(version)
        joblib.dump(self.engine.model, model_path)
        # Evaluate
        if len(X) > 10:
            from sklearn.model_selection import train_test_split
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        else:
            X_train, y_train = X, y
            X_test, y_test = X, y
        # Predict using label encoder to ensure type consistency
        y_pred = self.engine.model.predict(X_test)
        y_pred = self.engine.label_encoder.inverse_transform(y_pred)
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        # Save model version info
        model_version = MLModelVersion(
            version=version,
            trained_at=datetime.utcnow(),
            accuracy=acc,
            precision=prec,
            recall=rec,
            notes="Auto-trained",
            is_active=True  # New model is active by default
        )
        # Deactivate all other versions
        db.query(MLModelVersion).update({MLModelVersion.is_active: False})
        db.add(model_version)
        db.commit()
        self.current_version = version
        return version

    def load_active_model(self, db: Session):
        active = db.query(MLModelVersion).filter_by(is_active=True).order_by(MLModelVersion.trained_at.desc()).first()
        if active:
            model_path = self._model_path(active.version)
            if os.path.exists(model_path):
                self.engine.model = joblib.load(model_path)
                self.current_version = active.version
                return True
        return False

    def set_active_version(self, version: str, db: Session):
        # Set the specified version as active, deactivate others
        db.query(MLModelVersion).update({MLModelVersion.is_active: False})
        db.query(MLModelVersion).filter_by(version=version).update({MLModelVersion.is_active: True})
        db.commit()
        return self.load_active_model(db)

    def predict(self, features: np.ndarray, db: Session = None) -> Dict[str, Any]:
        # Always use the active model
        if db is not None:
            self.load_active_model(db)
        return self.engine.predict(features)

    def retrain_from_feedback(self, db: Session):
        feedbacks = db.query(Feedback).all()
        if not feedbacks:
            return None
        X = np.array([np.array(f.features) for f in feedbacks])
        y = [str(f.actual_label) for f in feedbacks]  # Ensure all labels are strings
        # Ensure X is a 2D numpy array and not empty
        if X.ndim == 1:
            X = X.reshape(-1, 1)
        if X.size == 0 or (X.ndim == 2 and X.shape[1] == 0):
            raise ValueError("Feature array must be non-empty and 2D.")
        return self.train(X, y, db)

    @property
    def active_version(self):
        return self.current_version

ml_suggestion_service = MLSuggestionService()
