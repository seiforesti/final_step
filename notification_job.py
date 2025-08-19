import os
import logging
from typing import Optional, List

import firebase_admin
from firebase_admin import credentials, messaging

try:
    cred = credentials.Certificate("/app/firebase-adminsdk.json")
    default_app = firebase_admin.initialize_app(cred)
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Failed to initialize Firebase: {e}")
    default_app = None

logger = logging.getLogger(__name__)

async def send_notification(
    title: str,
    body: str,
    token: Optional[str] = None,
    topic: Optional[str] = None,
    data: Optional[dict] = None
) -> bool:
    if default_app is None:
        logger.warning("Firebase not initialized - notification will not be sent")
        return False

    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            data=data or {},
            token=token,
            topic=topic
        )

        response = messaging.send(message)
        logger.info(f"Successfully sent notification: {response}")
        return True
    except Exception as e:
        logger.error(f"Error sending notification: {e}")
        return False
