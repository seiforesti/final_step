import os
import requests
import smtplib
from email.mime.text import MIMEText
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

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
    
    async def _send_email_notification(
        self, 
        message: str, 
        recipients: List[str], 
        priority: str = "normal",
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Send email notification"""
        subject = f"[{priority.upper()}] Data Governance Notification"
        if metadata and metadata.get("title"):
            subject = f"[{priority.upper()}] {metadata['title']}"
        
        body = self._format_email_body(message, priority, metadata)
        
        # Filter out empty/invalid recipients
        valid_recipients = [email for email in recipients if email and email.strip()]
        if not valid_recipients:
            logger.warning("No valid email recipients provided")
            return
        
        msg = MIMEText(body, 'html')
        msg["Subject"] = subject
        msg["From"] = self.email_from
        msg["To"] = ", ".join(valid_recipients)
        
        try:
            if self.smtp_port == 465:
                # Use SSL for port 465 (Gmail, etc.)
                with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as server:
                    if self.smtp_username and self.smtp_password:
                        server.login(self.smtp_username, self.smtp_password)
                    server.sendmail(self.email_from, valid_recipients, msg.as_string())
            else:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.ehlo()
                    if self.smtp_port == 587:
                        server.starttls()
                    if self.smtp_username and self.smtp_password:
                        server.login(self.smtp_username, self.smtp_password)
                    server.sendmail(self.email_from, valid_recipients, msg.as_string())
            
            logger.info(f"Email notification sent to {len(valid_recipients)} recipients")
            
        except Exception as e:
            logger.error(f"Failed to send email notification: {str(e)}")
            raise
    
    async def _send_slack_notification(
        self, 
        message: str, 
        priority: str = "normal",
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Send Slack notification"""
        if not self.slack_webhook_url:
            logger.warning("Slack webhook URL not configured")
            return
        
        # Format Slack message
        slack_message = self._format_slack_message(message, priority, metadata)
        
        try:
            response = requests.post(
                self.slack_webhook_url, 
                json=slack_message,
                timeout=10
            )
            response.raise_for_status()
            logger.info("Slack notification sent successfully")
            
        except Exception as e:
            logger.error(f"Failed to send Slack notification: {str(e)}")
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
