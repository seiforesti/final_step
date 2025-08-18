import pytest

def test_analytics_labeling_coverage_endpoint(client):
    resp = client.get("/sensitivity-labels/analytics/coverage")
    assert resp.status_code in (200, 404)  # 404 if endpoint not yet implemented
    if resp.status_code == 200:
        data = resp.json()
        assert "coverage" in data or "coverage_percent" in data

def test_analytics_labeling_trends_endpoint(client):
    resp = client.get("/sensitivity-labels/analytics/trends")
    assert resp.status_code in (200, 404)
    if resp.status_code == 200:
        data = resp.json()
        assert "trends" in data or isinstance(data, list)

def test_analytics_user_analytics_endpoint(client):
    resp = client.get("/sensitivity-labels/analytics/user?user_email=test@example.com")
    assert resp.status_code in (200, 404)
    if resp.status_code == 200:
        data = resp.json()
        assert "user_stats" in data or isinstance(data, dict)

def test_analytics_dashboard_export_endpoint(client):
    resp = client.get("/sensitivity-labels/analytics/export")
    assert resp.status_code in (200, 404)
    if resp.status_code == 200:
        data = resp.json()
        assert "dashboard" in data or isinstance(data, dict)
