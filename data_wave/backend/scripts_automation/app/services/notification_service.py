import os
import requests
import smtplib
from email.mime.text import MIMEText
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import asyncio
from sqlalchemy.orm import Session

SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL")

EMAIL_FROM = os.environ.get("EMAIL_FROM", "noreply@example.com")
SMTP_SERVER = os.environ.get("SMTP_SERVER", "localhost")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 25))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
EMAIL_ADMINS = os.environ.get("EMAIL_ADMINS", "").split(",")

logger = logging.getLogger(__name__)


class NotificationService:
    """Enterprise notification service for data governance events"""
    
    def __init__(self):
        self.slack_webhook_url = SLACK_WEBHOOK_URL
        self.email_from = EMAIL_FROM
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.smtp_username = SMTP_USERNAME
        self.smtp_password = SMTP_PASSWORD
        self.email_admins = EMAIL_ADMINS
    
    async def send_notification(
        self, 
        notification_type: str, 
        message: str, 
        recipients: List[str], 
        priority: str = "normal",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Send notification through multiple channels"""
        try:
            results = {
                "email": False,
                "slack": False,
                "success": False,
                "errors": []
            }
            
            # Send email notification
            if recipients:
                try:
                    await self._send_email_notification(message, recipients, priority, metadata)
                    results["email"] = True
                except Exception as e:
                    results["errors"].append(f"Email error: {str(e)}")
                    logger.error(f"Email notification failed: {str(e)}")
            
            # Send Slack notification for high priority
            if priority in ["high", "critical"] and self.slack_webhook_url:
                try:
                    await self._send_slack_notification(message, priority, metadata)
                    results["slack"] = True
                except Exception as e:
                    results["errors"].append(f"Slack error: {str(e)}")
                    logger.error(f"Slack notification failed: {str(e)}")

            # Broadcast via WebSocket service if available
            try:
                from app.services.websocket_service import WebSocketService
                ws = WebSocketService()
                payload = {
                    "type": f"notification:{notification_type}",
                    "priority": priority,
                    "message": message,
                    "metadata": metadata or {},
                    "timestamp": datetime.utcnow().isoformat()
                }
                # Non-blocking send
                try:
                    asyncio.create_task(ws.broadcast_json(payload))
                except RuntimeError:
                    # No running loop: ignore
                    pass
            except Exception:
                pass
            
            results["success"] = results["email"] or results["slack"]
            return results
            
        except Exception as e:
            logger.error(f"Notification service error: {str(e)}")
            return {
                "email": False,
                "slack": False,
                "success": False,
                "errors": [f"Service error: {str(e)}"]
            }

    async def create_notification_record(
        self,
        session: Session,
        user_id: str,
        title: str,
        message: str,
        notification_type: str,
        channel: str = "in_app",
        data_source_id: Optional[int] = None,
        recipient: Optional[str] = None,
        priority: str = "normal",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a notification record in the database"""
        try:
            from app.models.notification_models import Notification, NotificationType, NotificationChannel as ChannelEnum
            
            # Validate notification type
            try:
                notification_type_enum = NotificationType(notification_type)
            except ValueError:
                notification_type_enum = NotificationType.INFO
            
            # Validate channel
            try:
                channel_enum = ChannelEnum(channel)
            except ValueError:
                channel_enum = ChannelEnum.IN_APP
            
            # Create notification record
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type_enum,
                channel=channel_enum,
                data_source_id=data_source_id,
                recipient=recipient or user_id,
                delivery_metadata={
                    "priority": priority,
                    "metadata": metadata or {},
                    "created_by_service": "NotificationService"
                }
            )
            
            session.add(notification)
            session.commit()
            session.refresh(notification)
            
            logger.info(f"Created notification record {notification.id} for user {user_id}")
            
            return {
                "success": True,
                "notification_id": notification.id,
                "status": notification.status.value,
                "created_at": notification.created_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating notification record: {str(e)}")
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _send_email_notification(
        self, 
        message: str, 
        recipients: List[str], 
        priority: str = "normal",
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Send email notification"""
        if not recipients:
            return
        
        subject = f"[{priority.upper()}] Data Governance Notification"
        body = message
        
        if metadata:
            body += "\n\nAdditional Information:\n"
            for key, value in metadata.items():
                body += f"{key}: {value}\n"
        
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = self.email_from
        msg['To'] = ", ".join(recipients)
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.smtp_username and self.smtp_password:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
        except Exception as e:
            logger.error(f"Email notification failed: {str(e)}")
            raise
    
    async def _send_slack_notification(
        self, 
        message: str, 
        priority: str = "normal",
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Send Slack notification"""
        if not self.slack_webhook_url:
            return
        
        payload = {
            "text": f"[{priority.upper()}] {message}",
            "attachments": []
        }
        
        if metadata:
            attachment = {
                "fields": [{"title": k, "value": str(v), "short": True} for k, v in metadata.items()]
            }
            payload["attachments"].append(attachment)
        
        try:
            response = requests.post(self.slack_webhook_url, json=payload, timeout=10)
            response.raise_for_status()
        except Exception as e:
            logger.error(f"Slack notification failed: {str(e)}")
            raise
    
    def _format_email_body(
        self, 
        message: str, 
        priority: str = "normal",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Format email body with HTML"""
        priority_colors = {
            "low": "#28a745",
            "normal": "#007bff", 
            "high": "#ffc107",
            "critical": "#dc3545"
        }
        
        color = priority_colors.get(priority, "#007bff")
        
        html_body = f"""
        <html>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: {color}; color: white; padding: 15px; border-radius: 5px;">
                    <h2 style="margin: 0;">Data Governance Notification</h2>
                    <p style="margin: 5px 0 0 0;">Priority: {priority.upper()}</p>
                </div>
                
                <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin-top: 20px;">
                    <p style="margin: 0; line-height: 1.6;">{message}</p>
                </div>
        """
        
        if metadata:
            html_body += """
                <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
                    <h4 style="margin: 0 0 10px 0;">Additional Information:</h4>
                    <ul style="margin: 0; padding-left: 20px;">
            """
            
            for key, value in metadata.items():
                if key != "title":  # Skip title as it's used in subject
                    html_body += f"<li><strong>{key}:</strong> {value}</li>"
            
            html_body += """
                    </ul>
                </div>
            """
        
        html_body += """
                <div style="margin-top: 20px; padding: 15px; background-color: #dee2e6; border-radius: 5px; font-size: 12px; color: #6c757d;">
                    <p style="margin: 0;">This is an automated notification from the Data Governance System.</p>
                    <p style="margin: 5px 0 0 0;">Generated at: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC") + """</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_body
    
    def _format_slack_message(
        self, 
        message: str, 
        priority: str = "normal",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Format Slack message with attachments"""
        priority_colors = {
            "low": "good",
            "normal": "#007bff",
            "high": "warning", 
            "critical": "danger"
        }
        
        color = priority_colors.get(priority, "#007bff")
        
        slack_message = {
            "text": f"*Data Governance Notification* - Priority: {priority.upper()}",
            "attachments": [
                {
                    "color": color,
                    "text": message,
                    "fields": [],
                    "footer": "Data Governance System",
                    "ts": int(datetime.now().timestamp())
                }
            ]
        }
        
        if metadata:
            for key, value in metadata.items():
                if key != "title":
                    slack_message["attachments"][0]["fields"].append({
                        "title": key.replace("_", " ").title(),
                        "value": str(value),
                        "short": True
                    })
        
        return slack_message

    async def get_notifications_by_user(
        self, 
        session: Session, 
        user_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get notifications for a specific user"""
        try:
            from app.models.notification_models import Notification
            
            # Query notifications for the user
            query = session.query(Notification).filter(
                Notification.user_id == user_id
            ).order_by(Notification.created_at.desc())
            
            # Apply pagination
            notifications = query.offset(offset).limit(limit).all()
            
            # Convert to list of dictionaries
            notification_list = []
            for notification in notifications:
                notification_list.append({
                    "id": notification.id,
                    "data_source_id": notification.data_source_id,
                    "user_id": notification.user_id,
                    "title": notification.title,
                    "message": notification.message,
                    "notification_type": notification.notification_type,
                    "channel": notification.channel,
                    "status": notification.status,
                    "sent_at": notification.sent_at,
                    "delivered_at": notification.delivered_at,
                    "read_at": notification.read_at,
                    "recipient": notification.recipient,
                    "created_at": notification.created_at,
                    "updated_at": notification.updated_at
                })
            
            return notification_list
            
        except Exception as e:
            logger.error(f"Error getting notifications for user {user_id}: {str(e)}")
            return []

    # ============================================================================
    # NOTIFICATION MANAGEMENT METHODS
    # ============================================================================

    @staticmethod
    def get_user_notifications(session: Session, user_id: str) -> List[Dict[str, Any]]:
        """Get notifications for a specific user"""
        try:
            from app.models.notification_models import Notification, NotificationResponse
            from sqlmodel import select
            
            statement = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
            notifications = session.execute(statement).scalars().all()
            
            return [NotificationResponse.from_orm(notification) for notification in notifications]
        except Exception as e:
            logger.error(f"Error getting user notifications: {str(e)}")
            return []

    @staticmethod
    def get_notification_by_id(session: Session, notification_id: int, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific notification by ID for a user"""
        try:
            from app.models.notification_models import Notification, NotificationResponse
            from sqlmodel import select
            
            statement = select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
            notification = session.execute(statement).scalars().first()
            
            if notification:
                return NotificationResponse.from_orm(notification)
            return None
        except Exception as e:
            logger.error(f"Error getting notification by ID: {str(e)}")
            return None

    @staticmethod
    def mark_notification_read(session: Session, notification_id: int, user_id: str) -> bool:
        """Mark a notification as read"""
        try:
            from app.models.notification_models import Notification
            from sqlmodel import select
            
            statement = select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
            notification = session.execute(statement).scalars().first()
            
            if notification:
                notification.status = "read"
                notification.read_at = datetime.now()
                session.add(notification)
                session.commit()
                return True
            return False
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            session.rollback()
            return False

    @staticmethod
    def mark_all_notifications_read(session: Session, user_id: str) -> int:
        """Mark all notifications as read for a user"""
        try:
            from app.models.notification_models import Notification
            from sqlmodel import select
            
            statement = select(Notification).where(
                Notification.user_id == user_id,
                Notification.status != "read"
            )
            notifications = session.execute(statement).scalars().all()
            
            count = 0
            for notification in notifications:
                notification.status = "read"
                notification.read_at = datetime.now()
                session.add(notification)
                count += 1
            
            session.commit()
            return count
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")
            session.rollback()
            return 0

    @staticmethod
    def acknowledge_notification(session: Session, notification_id: int, user_id: str) -> bool:
        """Acknowledge a notification"""
        try:
            from app.models.notification_models import Notification
            from sqlmodel import select
            
            statement = select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
            notification = session.execute(statement).scalars().first()
            
            if notification:
                notification.status = "delivered"
                notification.delivered_at = datetime.now()
                session.add(notification)
                session.commit()
                return True
            return False
        except Exception as e:
            logger.error(f"Error acknowledging notification: {str(e)}")
            session.rollback()
            return False

    @staticmethod
    def delete_notification(session: Session, notification_id: int, user_id: str) -> bool:
        """Delete a notification"""
        try:
            from app.models.notification_models import Notification
            from sqlmodel import select
            
            statement = select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
            notification = session.execute(statement).scalars().first()
            
            if notification:
                session.delete(notification)
                session.commit()
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting notification: {str(e)}")
            session.rollback()
            return False

    @staticmethod
    def get_notification_stats(session: Session, user_id: str) -> Dict[str, Any]:
        """Get notification statistics for a user"""
        try:
            from app.models.notification_models import Notification
            from sqlmodel import select
            
            statement = select(Notification).where(Notification.user_id == user_id)
            notifications = session.execute(statement).scalars().all()
            
            total_notifications = len(notifications)
            read_notifications = len([n for n in notifications if n.status == "read"])
            unread_notifications = total_notifications - read_notifications
            
            # Count by type
            type_counts = {}
            for notification in notifications:
                notification_type = notification.notification_type
                type_counts[notification_type] = type_counts.get(notification_type, 0) + 1
            
            # Count by status
            status_counts = {}
            for notification in notifications:
                status = notification.status
                status_counts[status] = status_counts.get(status, 0) + 1
            
            return {
                "total_notifications": total_notifications,
                "read_notifications": read_notifications,
                "unread_notifications": unread_notifications,
                "type_breakdown": type_counts,
                "status_breakdown": status_counts
            }
        except Exception as e:
            logger.error(f"Error getting notification stats: {str(e)}")
            return {
                "total_notifications": 0,
                "read_notifications": 0,
                "unread_notifications": 0,
                "type_breakdown": {},
                "status_breakdown": {}
            }

    @staticmethod
    def get_notification_preferences(session: Session, user_id: str) -> Dict[str, Any]:
        """Get notification preferences for a user"""
        try:
            from app.models.notification_models import NotificationPreference, NotificationPreferenceResponse
            from sqlmodel import select
            
            # Query for user preferences
            statement = select(NotificationPreference).where(NotificationPreference.user_id == user_id)
            preference = session.execute(statement).scalars().first()
            
            if preference:
                # Return real preferences from database
                return NotificationPreferenceResponse.from_orm(preference)
            else:
                # Create default preferences for new user
                default_preferences = NotificationPreference(
                    user_id=user_id,
                    email_enabled=True,
                    slack_enabled=True,
                    in_app_enabled=True,
                    webhook_enabled=False,
                    sms_enabled=False,
                    alert_enabled=True,
                    info_enabled=True,
                    warning_enabled=True,
                    error_enabled=True,
                    success_enabled=True,
                    quiet_hours_enabled=False,
                    quiet_hours_start="22:00",
                    quiet_hours_end="08:00",
                    notification_frequency="immediate"
                )
                
                session.add(default_preferences)
                session.commit()
                session.refresh(default_preferences)
                
                return NotificationPreferenceResponse.from_orm(default_preferences)
                
        except Exception as e:
            logger.error(f"Error getting notification preferences: {str(e)}")
            # Return default preferences as fallback
            return {
                "email_enabled": True,
                "slack_enabled": True,
                "in_app_enabled": True,
                "webhook_enabled": False,
                "sms_enabled": False,
                "alert_enabled": True,
                "info_enabled": True,
                "warning_enabled": True,
                "error_enabled": True,
                "success_enabled": True,
                "quiet_hours_enabled": False,
                "quiet_hours_start": "22:00",
                "quiet_hours_end": "08:00",
                "notification_frequency": "immediate"
            }

    @staticmethod
    def update_notification_preferences(session: Session, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update notification preferences for a user"""
        try:
            from app.models.notification_models import NotificationPreference
            from sqlmodel import select
            
            # Get existing preferences or create new ones
            statement = select(NotificationPreference).where(NotificationPreference.user_id == user_id)
            preference = session.execute(statement).scalars().first()
            
            if not preference:
                # Create new preferences
                preference = NotificationPreference(user_id=user_id)
                session.add(preference)
            
            # Update preference fields
            updateable_fields = [
                "email_enabled", "slack_enabled", "in_app_enabled", "webhook_enabled", "sms_enabled",
                "alert_enabled", "info_enabled", "warning_enabled", "error_enabled", "success_enabled",
                "quiet_hours_enabled", "quiet_hours_start", "quiet_hours_end", "notification_frequency"
            ]
            
            for field in updateable_fields:
                if field in preferences:
                    if isinstance(preferences[field], bool) or isinstance(preferences[field], str):
                        setattr(preference, field, preferences[field])
                    else:
                        logger.warning(f"Invalid value type for field {field}: {type(preferences[field])}")
                        return False
            
            # Update timestamp
            preference.updated_at = datetime.now()
            
            session.add(preference)
            session.commit()
            
            logger.info(f"Updated notification preferences for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating notification preferences: {str(e)}")
            session.rollback()
            return False

    @staticmethod
    def get_notification_templates(session: Session, template_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get notification templates"""
        try:
            from app.models.notification_models import NotificationTemplate, NotificationTemplateResponse
            from sqlmodel import select
            
            # Query for templates
            query = select(NotificationTemplate).where(NotificationTemplate.is_active == True)
            
            if template_type:
                query = query.where(NotificationTemplate.template_type == template_type)
            
            templates = session.execute(query).scalars().all()
            
            if templates:
                # Return real templates from database
                return [NotificationTemplateResponse.from_orm(template) for template in templates]
            else:
                # Create default system templates if none exist
                default_templates = [
                    NotificationTemplate(
                        template_name="Data Source Alert",
                        template_type="alert",
                        subject="Data Source Alert: {data_source_name}",
                        message="The data source {data_source_name} has encountered an issue: {issue_description}",
                        variables=["data_source_name", "issue_description"],
                        is_system=True,
                        created_by="system"
                    ),
                    NotificationTemplate(
                        template_name="Scan Complete",
                        template_type="success",
                        subject="Scan Complete: {data_source_name}",
                        message="The scan for {data_source_name} has completed successfully. {records_processed} records were processed.",
                        variables=["data_source_name", "records_processed"],
                        is_system=True,
                        created_by="system"
                    ),
                    NotificationTemplate(
                        template_name="Security Warning",
                        template_type="warning",
                        subject="Security Warning: {data_source_name}",
                        message="A security concern has been detected for {data_source_name}: {security_issue}",
                        variables=["data_source_name", "security_issue"],
                        is_system=True,
                        created_by="system"
                    )
                ]
                
                for template in default_templates:
                    session.add(template)
                
                session.commit()
                
                # Return the newly created templates
                return [NotificationTemplateResponse.from_orm(template) for template in default_templates]
                
        except Exception as e:
            logger.error(f"Error getting notification templates: {str(e)}")
            # Return default templates as fallback
            return [
                {
                    "id": 1,
                    "template_name": "Data Source Alert",
                    "template_type": "alert",
                    "subject": "Data Source Alert: {data_source_name}",
                    "message": "The data source {data_source_name} has encountered an issue: {issue_description}",
                    "variables": ["data_source_name", "issue_description"],
                    "is_active": True,
                    "is_system": True,
                    "usage_count": 0,
                    "created_by": "system"
                },
                {
                    "id": 2,
                    "template_name": "Scan Complete",
                    "template_type": "success",
                    "subject": "Scan Complete: {data_source_name}",
                    "message": "The scan for {data_source_name} has completed successfully. {records_processed} records were processed.",
                    "variables": ["data_source_name", "records_processed"],
                    "is_active": True,
                    "is_system": True,
                    "usage_count": 0,
                    "created_by": "system"
                },
                {
                    "id": 3,
                    "template_name": "Security Warning",
                    "template_type": "warning",
                    "subject": "Security Warning: {data_source_name}",
                    "message": "A security concern has been detected for {data_source_name}: {security_issue}",
                    "variables": ["data_source_name", "security_issue"],
                    "is_active": True,
                    "is_system": True,
                    "usage_count": 0,
                    "created_by": "system"
                }
            ]

    @staticmethod
    def get_notification_channels(session: Session) -> List[Dict[str, Any]]:
        """Get available notification channels"""
        try:
            from app.models.notification_models import NotificationChannel, NotificationChannelResponse
            from sqlmodel import select
            
            # Query for channels
            statement = select(NotificationChannel).where(NotificationChannel.is_enabled == True)
            channels = session.execute(statement).scalars().all()
            
            if channels:
                # Return real channels from database
                return [NotificationChannelResponse.from_orm(channel) for channel in channels]
            else:
                # Create default channels if none exist
                default_channels = [
                    NotificationChannel(
                        channel_id="email",
                        channel_name="Email",
                        channel_description="Send notifications via email",
                        is_enabled=True,
                        config={
                            "smtp_server": "localhost",
                            "smtp_port": 25
                        },
                        supports_priority=True,
                        supports_attachments=False,
                        max_message_length=10000
                    ),
                    NotificationChannel(
                        channel_id="slack",
                        channel_name="Slack",
                        channel_description="Send notifications via Slack",
                        is_enabled=True,
                        config={
                            "webhook_url": "configured"
                        },
                        supports_priority=True,
                        supports_attachments=True,
                        max_message_length=3000
                    ),
                    NotificationChannel(
                        channel_id="in_app",
                        channel_name="In-App",
                        channel_description="Show notifications in the application",
                        is_enabled=True,
                        config={},
                        supports_priority=True,
                        supports_attachments=False,
                        max_message_length=None
                    )
                ]
                
                for channel in default_channels:
                    session.add(channel)
                
                session.commit()
                
                # Return the newly created channels
                return [NotificationChannelResponse.from_orm(channel) for channel in default_channels]
                
        except Exception as e:
            logger.error(f"Error getting notification channels: {str(e)}")
            # Return default channels as fallback
            return [
                {
                    "id": 1,
                    "channel_id": "email",
                    "channel_name": "Email",
                    "channel_description": "Send notifications via email",
                    "is_enabled": True,
                    "config": {
                        "smtp_server": "localhost",
                        "smtp_port": 25
                    },
                    "supports_priority": True,
                    "supports_attachments": False,
                    "max_message_length": 10000
                },
                {
                    "id": 2,
                    "channel_id": "slack",
                    "channel_name": "Slack",
                    "channel_description": "Send notifications via Slack",
                    "is_enabled": True,
                    "config": {
                        "webhook_url": "configured"
                    },
                    "supports_priority": True,
                    "supports_attachments": True,
                    "max_message_length": 3000
                },
                {
                    "id": 3,
                    "channel_id": "in_app",
                    "channel_name": "In-App",
                    "channel_description": "Show notifications in the application",
                    "is_enabled": True,
                    "config": {},
                    "supports_priority": True,
                    "supports_attachments": False,
                    "max_message_length": None
                }
            ]

    @staticmethod
    def test_notification_channel(session: Session, channel_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Test a notification channel"""
        try:
            channel_type = channel_data.get("channel_type")
            test_message = channel_data.get("test_message", "This is a test notification")
            
            if channel_type == "email":
                # Test email configuration
                recipient = channel_data.get("recipient", user_id)
                try:
                    # Get channel configuration from database
                    from app.models.notification_models import NotificationChannel
                    from sqlmodel import select
                    
                    channel_statement = select(NotificationChannel).where(
                        NotificationChannel.channel_id == "email",
                        NotificationChannel.is_enabled == True
                    )
                    channel = session.execute(channel_statement).scalars().first()
                    
                    if channel and channel.config:
                        # Test actual email configuration
                        import smtplib
                        from email.mime.text import MIMEText
                        
                        smtp_server = channel.config.get("smtp_server", "localhost")
                        smtp_port = channel.config.get("smtp_port", 25)
                        smtp_username = channel.config.get("smtp_username")
                        smtp_password = channel.config.get("smtp_password")
                        
                        # Create test message
                        msg = MIMEText(test_message)
                        msg['Subject'] = "Test Notification - Data Governance System"
                        msg['From'] = "noreply@datagovernance.com"
                        msg['To'] = recipient
                        
                        # Test connection
                        with smtplib.SMTP(smtp_server, smtp_port) as server:
                            if smtp_username and smtp_password:
                                server.starttls()
                                server.login(smtp_username, smtp_password)
                            
                            # Send test message
                            server.send_message(msg)
                        
                        logger.info(f"Test email sent successfully to {recipient}")
                        return {
                            "success": True,
                            "message": f"Test email sent successfully to {recipient}",
                            "channel": "email",
                            "config_tested": {
                                "smtp_server": smtp_server,
                                "smtp_port": smtp_port,
                                "authentication": bool(smtp_username and smtp_password)
                            }
                        }
                    else:
                        return {
                            "success": False,
                            "message": "Email channel not configured or disabled",
                            "channel": "email"
                        }
                        
                except Exception as e:
                    logger.error(f"Email test failed: {str(e)}")
                    return {
                        "success": False,
                        "message": f"Email test failed: {str(e)}",
                        "channel": "email",
                        "error_details": str(e)
                    }
            
            elif channel_type == "slack":
                # Test Slack configuration
                try:
                    # Get channel configuration from database
                    from app.models.notification_models import NotificationChannel
                    from sqlmodel import select
                    
                    channel_statement = select(NotificationChannel).where(
                        NotificationChannel.channel_id == "slack",
                        NotificationChannel.is_enabled == True
                    )
                    channel = session.execute(channel_statement).scalars().first()
                    
                    if channel and channel.config:
                        webhook_url = channel.config.get("webhook_url")
                        if webhook_url and webhook_url != "configured":
                            # Test actual Slack webhook
                            import requests
                            
                            payload = {
                                "text": f"Test Notification: {test_message}",
                                "username": "Data Governance System",
                                "icon_emoji": ":bell:"
                            }
                            
                            response = requests.post(webhook_url, json=payload, timeout=10)
                            response.raise_for_status()
                            
                            logger.info("Test Slack message sent successfully")
                            return {
                                "success": True,
                                "message": "Test Slack message sent successfully",
                                "channel": "slack",
                                "config_tested": {
                                    "webhook_url": "configured",
                                    "response_status": response.status_code
                                }
                            }
                        else:
                            return {
                                "success": False,
                                "message": "Slack webhook URL not configured",
                                "channel": "slack"
                            }
                    else:
                        return {
                            "success": False,
                            "message": "Slack channel not configured or disabled",
                            "channel": "slack"
                        }
                        
                except Exception as e:
                    logger.error(f"Slack test failed: {str(e)}")
                    return {
                        "success": False,
                        "message": f"Slack test failed: {str(e)}",
                        "channel": "slack",
                        "error_details": str(e)
                    }
            
            else:
                return {
                    "success": False,
                    "message": f"Unsupported channel type: {channel_type}",
                    "channel": channel_type
                }
                
        except Exception as e:
            logger.error(f"Error testing notification channel: {str(e)}")
            return {
                "success": False,
                "message": f"Channel test failed: {str(e)}",
                "channel": "unknown",
                "error_details": str(e)
            }


# Legacy functions for backward compatibility
def send_email(subject: str, body: str, to: List[str]):
    # Filter out empty/invalid recipients
    valid_recipients = [email for email in to if email and email.strip()]
    if not valid_recipients:
        return  # No valid recipients, skip sending
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = ", ".join(valid_recipients)
    if SMTP_PORT == 465:
        # Use SSL for port 465 (Gmail, etc.)
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(EMAIL_FROM, valid_recipients, msg.as_string())
    else:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            if SMTP_PORT == 587:
                server.starttls()
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(EMAIL_FROM, valid_recipients, msg.as_string())

def send_slack_notification(message: str):
    if not SLACK_WEBHOOK_URL:
        return
    requests.post(SLACK_WEBHOOK_URL, json={"text": message})
