import time
import asyncio
from sqlalchemy.orm import Session
from app.db_session import get_session
from sensitivity_labeling import models
from datetime import datetime, timedelta
from aiosmtplib import send as send_email
from email.message import EmailMessage
from .models import NotificationPreference
import firebase_admin
from firebase_admin import messaging, credentials

EMAIL_FROM = "nxci_noreplay@nxcidata.com"  # Set your sender email
SMTP_HOST = "smtp"  # Set your SMTP host
SMTP_PORT = 25       # Set your SMTP port

# Initialize Firebase app (do this once at startup)
if not firebase_admin._apps:
    cred = credentials.Certificate("/app/firebase-adminsdk.json")  # Update path as needed
    firebase_admin.initialize_app(cred)

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
        print(f"Failed to send email to {to_email}: {e}")

async def send_notification_push(to_user_token, message):
    try:
        msg = messaging.Message(
            notification=messaging.Notification(
                title="Notification",
                body=message
            ),
            token=to_user_token
        )
        response = messaging.send(msg)
        print(f"Push notification sent: {response}")
    except Exception as e:
        print(f"Failed to send push notification: {e}")

# --- User Preferences Stub ---
def get_user_notification_channels(user_email):
    # Fetch from DB/user preferences. For now, return all channels for demo.
    from app.db_session import get_session
    db = get_session()
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_email == user_email).first()
    if pref and 'channels' in pref.preferences:
        return pref.preferences['channels']
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
