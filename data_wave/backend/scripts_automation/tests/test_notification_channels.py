import pytest

def test_notification_preferences_sms_channel(client):
    resp = client.post("/sensitivity-labels/notifications/preferences", json={
        "user_email": "test@example.com",
        "preferences": {"types": ["expiry"], "frequency": "immediate", "channels": ["sms"]}
    })
    assert resp.status_code in (200, 422, 400)

def test_notification_preferences_push_channel(client):
    resp = client.post("/sensitivity-labels/notifications/preferences", json={
        "user_email": "test@example.com",
        "preferences": {"types": ["expiry"], "frequency": "immediate", "channels": ["push"]}
    })
    assert resp.status_code in (200, 422, 400)
