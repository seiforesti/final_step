from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, crud
from app.db_session import get_session
from datetime import datetime, timedelta
from .models import NotificationPreference

router = APIRouter(prefix="/sensitivity-labels/notifications", tags=["Notifications"])

@router.get("/", response_model=List[dict])
def list_notifications(user_email: str, db: Session = Depends(get_session)):
    """List notifications for a user."""
    notifs = db.query(models.Notification).filter(models.Notification.user_email == user_email).order_by(models.Notification.created_at.desc()).all()
    return [
        {
            "id": n.id,
            "type": n.type,
            "message": n.message,
            "related_object_type": n.related_object_type,
            "related_object_id": n.related_object_id,
            "created_at": n.created_at,
            "read": n.read,
            "read_at": n.read_at
        }
        for n in notifs
    ]

@router.post("/{notif_id}/mark-read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_session)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    notif.read_at = datetime.utcnow()
    db.commit()
    return {"status": "ok"}

@router.delete("/{notif_id}")
def delete_notification(notif_id: int, db: Session = Depends(get_session)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"status": "deleted"}

@router.post("/preferences")
def set_notification_preferences(
    user_email: str = Body(...),
    preferences: dict = Body(...),
    db: Session = Depends(get_session)
):
    """
    Set notification preferences for a user (types, frequency, channels).
    """
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_email == user_email).first()
    if pref:
        pref.preferences = preferences
    else:
        pref = NotificationPreference(user_email=user_email, preferences=preferences)
        db.add(pref)
    db.commit()
    return {"status": "ok", "user_email": user_email, "preferences": preferences}

@router.get("/preferences")
def get_notification_preferences(user_email: str, db: Session = Depends(get_session)):
    """
    Get notification preferences for a user.
    """
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_email == user_email).first()
    if pref:
        return {"user_email": user_email, "preferences": pref.preferences}
    # Default preferences if not set
    return {"user_email": user_email, "preferences": {"types": ["expiry", "review"], "frequency": "daily", "channels": ["in-app"]}}

@router.post("/register-push-token")
def register_push_token(
    user_email: str = Body(...),
    push_token: str = Body(...),
    db: Session = Depends(get_session)
):
    """
    Register a device push token for a user (for FCM push notifications).
    """
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_email == user_email).first()
    if not pref:
        pref = NotificationPreference(user_email=user_email, preferences={"channels": ["push"], "push_tokens": [push_token]})
        db.add(pref)
    else:
        tokens = pref.preferences.get("push_tokens", [])
        if push_token not in tokens:
            tokens.append(push_token)
        pref.preferences["push_tokens"] = tokens
        # Ensure 'push' is in channels
        channels = pref.preferences.get("channels", [])
        if "push" not in channels:
            channels.append("push")
        pref.preferences["channels"] = channels
    db.commit()
    return {"status": "ok", "user_email": user_email, "push_tokens": pref.preferences["push_tokens"]}

@router.get("/analytics")
def notification_analytics(user_email: str, db: Session = Depends(get_session)):
    """Return notification analytics for a user (total, unread, read, types, date range)."""
    q = db.query(models.Notification).filter(models.Notification.user_email == user_email)
    total = q.count()
    unread = q.filter(models.Notification.read == False).count()
    read = q.filter(models.Notification.read == True).count()
    types = list({n.type for n in q.all()})
    created_from = q.order_by(models.Notification.created_at.asc()).first()
    created_to = q.order_by(models.Notification.created_at.desc()).first()
    return {
        "total_notifications": total,
        "unread": unread,
        "read": read,
        "types": types,
        "created_from": created_from.created_at.isoformat() if created_from else None,
        "created_to": created_to.created_at.isoformat() if created_to else None
    }
