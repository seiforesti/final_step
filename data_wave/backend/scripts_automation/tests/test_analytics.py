import pytest
from sensitivity_labeling import analytics

def test_analytics_exports_exist():
    # This is a stub test. Expand with real DB/session mocking as needed.
    assert hasattr(analytics, "get_labeling_coverage")
    assert hasattr(analytics, "get_labeling_trends")
    assert hasattr(analytics, "get_user_analytics")
    assert hasattr(analytics, "export_dashboard_data")
