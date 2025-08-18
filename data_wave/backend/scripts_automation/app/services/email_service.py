# email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import traceback

from app.configs.config import SMTP_CONFIG



def send_email(to_email: str, subject: str, body: str, html: Optional[str] = None) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_CONFIG["from_email"]
        msg["To"] = to_email

        if isinstance(body, bytes):
            body = body.decode("utf-8")
        part1 = MIMEText(body, "plain")
        msg.attach(part1)

        if html:
            if isinstance(html, bytes):
                html = html.decode("utf-8")
            part2 = MIMEText(html, "html")
            msg.attach(part2)

        with smtplib.SMTP_SSL(SMTP_CONFIG["server"], SMTP_CONFIG["port"]) as server:
            server.login(SMTP_CONFIG["username"], SMTP_CONFIG["password"])
            server.sendmail(SMTP_CONFIG["from_email"], to_email, msg.as_string())

        return True

    except Exception as e:
        tb_str = traceback.format_exc()
        print(f"❌ Failed to send email to {to_email}: {str(e)}\nTraceback:\n{tb_str}")
        return False
