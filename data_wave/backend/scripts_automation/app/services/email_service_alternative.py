import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import traceback

# Alternative email sending using aiosmtplib for async support and better handling
import asyncio
import aiosmtplib

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))  # Port TLS pour Gmail
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
if isinstance(SMTP_USERNAME, bytes):
    SMTP_USERNAME = SMTP_USERNAME.decode('utf-8')
elif isinstance(SMTP_USERNAME, str):
    SMTP_USERNAME = SMTP_USERNAME.strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
if isinstance(SMTP_PASSWORD, bytes):
    SMTP_PASSWORD = SMTP_PASSWORD.decode('utf-8')
elif isinstance(SMTP_PASSWORD, str):
    SMTP_PASSWORD = SMTP_PASSWORD.strip()
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USERNAME)
if isinstance(EMAIL_FROM, bytes):
    EMAIL_FROM = EMAIL_FROM.decode('utf-8')
elif isinstance(EMAIL_FROM, str):
    EMAIL_FROM = EMAIL_FROM.strip()

async def send_email_async(to_email: str, subject: str, body: str, html: Optional[str] = None) -> bool:
    try:
        if isinstance(to_email, bytes):
            to_email = to_email.decode('utf-8')
        if isinstance(subject, bytes):
            subject = subject.decode('utf-8')
        if isinstance(body, bytes):
            body = body.decode('utf-8')
        if html and isinstance(html, bytes):
            html = html.decode('utf-8')

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM
        msg["To"] = to_email

        part1 = MIMEText(body, "plain")
        msg.attach(part1)

        if html:
            part2 = MIMEText(html, "html")
            msg.attach(part2)

        # Utilise start_tls=True pour le port 587
        smtp = aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT, start_tls=True)
        await smtp.connect()
        await smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        await smtp.sendmail(EMAIL_FROM, [to_email], msg.as_string())
        await smtp.quit()
        return True
    except Exception as e:
        tb_str = traceback.format_exc()
        error_message = e.decode('utf-8') if isinstance(e, bytes) else str(e)
        print(f"Failed to send email to {to_email}: {error_message}\nTraceback:\n{tb_str}")
        return False

def send_email(to_email: str, subject: str, body: str, html: Optional[str] = None) -> bool:
    return asyncio.run(send_email_async(to_email, subject, body, html))
