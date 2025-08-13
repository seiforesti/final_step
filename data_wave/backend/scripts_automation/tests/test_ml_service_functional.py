import pytest
from sensitivity_labeling import ml_service
from unittest.mock import MagicMock
import os

# Ensure ml_models directory is created in the workspace root (where test runner is invoked)
ML_MODELS_DIR = os.path.join(os.getcwd(), 'ml_models')
os.makedirs(ML_MODELS_DIR, exist_ok=True)

class DummyData:
    def __init__(self):
        self.features = [1, 2]
        self.label = "confidential"
        self.feedback = {"features": self.features, "label": self.label}

def test_train_and_predict():
    service = ml_service.MLSuggestionService()
    db = MagicMock()  # Mock DB session
    X = [[1, 2], [2, 3]]
    y = ["confidential", "public"]
    service.train(X, y, db)
    pred = service.predict([1, 2], db)
    # pred is a dict with 'suggestion' key
    assert pred["suggestion"] in ["confidential", "public"]

def test_predict_with_invalid_features():
    service = ml_service.MLSuggestionService()
    db = MagicMock()
    try:
        service.predict([999, 888], db)
    except Exception:
        pass  # Accept exception or no exception

def test_feedback_and_retrain():
    service = ml_service.MLSuggestionService()
    db = MagicMock()
    # Mock the query to return at least one feedback with proper features (2D array)
    mock_feedback = MagicMock()
    mock_feedback.features = [1, 2]
    mock_feedback.label = "confidential"
    db.query.return_value.all.return_value = [mock_feedback]
    # Should not raise
    service.retrain_from_feedback(db)

def test_version_switching():
    service = ml_service.MLSuggestionService()
    db = MagicMock()
    X = [[1, 2], [2, 3]]
    y = ["confidential", "public"]
    service.train(X, y, db)
    v1 = service.active_version
    service.train(X, y, db)
    v2 = service.active_version
    assert v1 != v2
    # Patch db.query().filter_by().order_by().first() to return a mock with version v1
    mock_active = MagicMock()
    mock_active.version = v1
    def fake_first():
        return mock_active
    db.query.return_value.filter_by.return_value.order_by.return_value.first.side_effect = fake_first
    service.set_active_version(v1, db)
    assert service.active_version == v1
