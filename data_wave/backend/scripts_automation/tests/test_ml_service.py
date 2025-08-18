import pytest
from sensitivity_labeling import ml_service

def test_ml_service_versioning():
    service = ml_service.MLSuggestionService()
    assert hasattr(service, "train")
    assert hasattr(service, "load_active_model")
    assert hasattr(service, "set_active_version")
    assert hasattr(service, "predict")
    assert hasattr(service, "retrain_from_feedback")
