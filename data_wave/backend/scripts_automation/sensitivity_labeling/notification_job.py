import time
import os
import json
import asyncio
import logging
from sqlalchemy.orm import Session
from app.db_session import get_session
from sensitivity_labeling import models
from datetime import datetime, timedelta
from aiosmtplib import send as send_email
from email.message import EmailMessage
from .models import NotificationPreference

# Lazy Firebase imports to avoid import-time side effects
try:
    import firebase_admin  # type: ignore
    from firebase_admin import messaging, credentials  # type: ignore
    _FIREBASE_AVAILABLE = True
except Exception:  # pragma: no cover
    firebase_admin = None  # type: ignore
    messaging = None  # type: ignore
    credentials = None  # type: ignore
    _FIREBASE_AVAILABLE = False

logger = logging.getLogger(__name__)

EMAIL_FROM = os.getenv("EMAIL_FROM", "nxci_noreplay@nxcidata.com")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp")
SMTP_PORT = int(os.getenv("SMTP_PORT", "25"))

# Firebase app singleton
_firebase_app_initialized = False

def _get_firebase_app():
    """
    Lazily initialize and return the Firebase app if credentials are available.
    - Uses env var FIREBASE_CREDENTIALS_JSON (default: /app/firebase-adminsdk.json)
    - Validates JSON content to avoid JSONDecodeError at import time
    - Returns None if unavailable; callers must gracefully degrade
    """
    global _firebase_app_initialized
    if not _FIREBASE_AVAILABLE:
        return None
    try:
        # If already initialized, reuse default app
        if _firebase_app_initialized and firebase_admin.get_app():
            return firebase_admin.get_app()
    except ValueError:
        # No app initialized yet
        pass

    cred_path = os.getenv("FIREBASE_CREDENTIALS_JSON", "/app/firebase-adminsdk.json")
    if not os.path.isfile(cred_path):
        logger.warning("Firebase credentials file not found at %s. Push notifications disabled.", cred_path)
        return None
    try:
        # Validate JSON file before passing to SDK to avoid JSONDecodeError
        with open(cred_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                logger.warning("Firebase credentials file is empty at %s. Push notifications disabled.", cred_path)
                return None
            json.loads(content)
        app = firebase_admin.initialize_app(credentials.Certificate(cred_path))
        _firebase_app_initialized = True
        logger.info("Firebase app initialized from %s", cred_path)
        return app
    except Exception as exc:  # pragma: no cover
        logger.warning("Failed to initialize Firebase app: %s. Push notifications disabled.", exc)
        return None

# --- Notification Channel Stubs ---
async def send_notification_email(to_email, subject, body):
    msg = EmailMessage()
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)
    try:
        await send_email(msg, hostname=SMTP_HOST, port=SMTP_PORT)
    except Exception as e:
        logger.warning("Failed to send email to %s: %s", to_email, e)

async def send_notification_push(to_user_token, message):
    if not _FIREBASE_AVAILABLE:
        logger.info("Firebase not available. Skipping push notification.")
        return
    app = _get_firebase_app()
    if app is None:
        return
    try:
        msg = messaging.Message(
            notification=messaging.Notification(
                title="Notification",
                body=message
            ),
            token=to_user_token
        )
        response = messaging.send(msg, app=app)
        logger.info("Push notification sent: %s", response)
    except Exception as e:
        logger.warning("Failed to send push notification: %s", e)

# --- User Preferences Service Integration ---
def get_user_notification_channels(user_email):
    """Get user notification channels from real user preference service"""
    try:
        from app.services.user_preference_service import UserPreferenceService
        from app.services.notification_service import NotificationService
        
        # Initialize preference and notification services
        preference_service = UserPreferenceService()
        notification_service = NotificationService()
        
        # Get user preferences from service
        user_preferences = preference_service.get_user_preferences(user_email)
        
        if user_preferences and 'notification_channels' in user_preferences:
            return user_preferences['notification_channels']
        
        # Fallback: get from notification service
        notification_preferences = notification_service.get_user_notification_preferences(user_email)
        if notification_preferences and 'channels' in notification_preferences:
            return notification_preferences['channels']
        
        # Final fallback: database query
        from app.db_session import get_session
        db = get_session()
        pref = db.query(NotificationPreference).filter(NotificationPreference.user_email == user_email).first()
        if pref and 'channels' in pref.preferences:
            return pref.preferences['channels']
        
        # Default channels if no preferences found
        return ["email", "push"]
        
    except Exception as e:
        logger.warning(f"Error getting user notification channels: {e}")
        return ["email", "push"]

async def send_notification(user_email, subject, message, notif_type=None):
    # Fetch all users who have subscribed to this notification type
    db = get_session()
    subscribers = db.query(NotificationPreference).all()
    tasks = []
    for pref in subscribers:
        channels = pref.preferences.get('channels', ['email'])
        types = pref.preferences.get('types', [])
        # Only send if user wants this notification type
        if notif_type and types and notif_type not in types:
            continue
        if 'email' in channels:
            tasks.append(send_notification_email(pref.user_email, subject, message))
        if 'push' in channels:
            push_tokens = pref.preferences.get('push_tokens', [])
            for token in push_tokens:
                tasks.append(send_notification_push(token, message))
    if tasks:
        await asyncio.gather(*tasks)

# --- Main Notification Job ---
def notification_background_job():
    db: Session = get_session()
    try:
        # Expiring labels (within 30 days)
        soon = datetime.utcnow() + timedelta(days=30)
        expiring = db.query(models.LabelProposal).filter(
            models.LabelProposal.expiry_date != None,
            models.LabelProposal.expiry_date <= soon,
            models.LabelProposal.status == models.LabelStatus.APPROVED
        ).all()
        for p in expiring:
            # Only notify if not already notified
            exists = db.query(models.Notification).filter_by(
                user_email=p.proposed_by,
                type='expiry',
                related_object_type=p.object_type,
                related_object_id=p.object_id,
                read=False
            ).first()
            if not exists:
                notif = models.Notification(
                    user_email=p.proposed_by,
                    type='expiry',
                    message=f"Label for {p.object_type} '{p.object_id}' is expiring soon.",
                    related_object_type=p.object_type,
                    related_object_id=p.object_id,
                    created_at=datetime.utcnow(),
                    read=False
                )
                db.add(notif)
                # Send notification via all channels (async)
                asyncio.run(send_notification(
                    p.proposed_by,
                    "Label Expiry Warning",
                    notif.message
                ))
        # Pending reviews (older than 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        pending = db.query(models.LabelProposal).filter(
            models.LabelProposal.status == models.LabelStatus.PROPOSED,
            models.LabelProposal.created_at <= week_ago
        ).all()
        for p in pending:
            exists = db.query(models.Notification).filter_by(
                user_email=p.proposed_by,
                type='review',
                related_object_type=p.object_type,
                related_object_id=p.object_id,
                read=False
            ).first()
            if not exists:
                notif = models.Notification(
                    user_email=p.proposed_by,
                    type='review',
                    message=f"Label proposal for {p.object_type} '{p.object_id}' is pending review.",
                    related_object_type=p.object_type,
                    related_object_id=p.object_id,
                    created_at=datetime.utcnow(),
                    read=False
                )
                db.add(notif)
                # Send notification via all channels (async)
                asyncio.run(send_notification(
                    p.proposed_by,
                    "Label Review Pending",
                    notif.message
                ))
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    while True:
        notification_background_job()
        time.sleep(3600)  # Run every hour
