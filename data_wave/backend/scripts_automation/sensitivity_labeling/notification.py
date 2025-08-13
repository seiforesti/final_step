from app.db_session import get_session
from .models import Notification, NotificationPreference
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, Dict

def send_notification(db: Session, user_email: str, type: str, message: str, related_object_type: Optional[str] = None, related_object_id: Optional[str] = None):
    notif = Notification(
        user_email=user_email,
        type=type,
        message=message,
        related_object_type=related_object_type,
        related_object_id=related_object_id,
        created_at=datetime.utcnow(),
        read=False
    )
    db.add(notif)
    db.commit()
    return notif

def mark_notification_read(db: Session, notification_id: int, user_email: str):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        return False
    if notif.user_email != user_email:
        return False
    notif.read = True
    notif.read_at = datetime.utcnow()
    db.commit()
    return True

def get_notification_preferences(db: Session, user_email: str) -> Optional[Dict]:
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_email == user_email).first()
    if pref:
        return pref.preferences
    return None

def set_notification_preferences(db: Session, user_email: str, preferences: Dict):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_email == user_email).first()
    if pref:
        pref.preferences = preferences
    else:
        pref = NotificationPreference(user_email=user_email, preferences=preferences)
        db.add(pref)
    db.commit()
    return pref
