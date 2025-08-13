"""
Tests Package for Enterprise Data Governance Platform
===================================================

This package contains test modules for the enterprise data governance platform.
"""

# Import test modules
from . import (
    conftest,
    test_analytics,
    test_analytics_api,
    test_api_edge_cases,
    test_cmd,
    test_crud,
    test_ml_service,
    test_ml_service_functional,
    test_notification_channels,
    test_notifications
)

__all__ = [
    "conftest",
    "test_analytics",
    "test_analytics_api",
    "test_api_edge_cases",
    "test_cmd",
    "test_crud",
    "test_ml_service",
    "test_ml_service_functional",
    "test_notification_channels",
    "test_notifications"
]

