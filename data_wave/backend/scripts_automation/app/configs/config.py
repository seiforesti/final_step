# config.py
import os
from dotenv import load_dotenv

# Charger les variables depuis un fichier .env
load_dotenv()

def clean_env(var_name: str, default: str = "") -> str:
    val = os.getenv(var_name, default)
    if isinstance(val, bytes):
        val = val.decode("utf-8")
    return val.strip()

# Dictionnaire de configuration SMTP
SMTP_CONFIG = {
    "server": clean_env("SMTP_SERVER", "smtp.gmail.com"),
    "port": int(clean_env("SMTP_PORT", "465")),
    "username": clean_env("SMTP_USERNAME"),
    "password": clean_env("SMTP_PASSWORD"),
    "from_email": clean_env("EMAIL_FROM", clean_env("SMTP_USERNAME")),
}

# OAuth configuration
OAUTH_CONFIG = {
    "google_client_id": clean_env("GOOGLE_CLIENT_ID"),
    "google_client_secret": clean_env("GOOGLE_CLIENT_SECRET"),
    "google_redirect_uri": clean_env("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback"),
    "microsoft_client_id": clean_env("MICROSOFT_CLIENT_ID"),
    "microsoft_client_secret": clean_env("MICROSOFT_CLIENT_SECRET"),
    "microsoft_redirect_uri": clean_env("MICROSOFT_REDIRECT_URI", "http://localhost:8000/auth/microsoft/callback"),
}
