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
    "google_client_id": "950547023330-d9ufg3raafbha6lesgnq5lfho5nc7fk4.apps.googleusercontent.com",
    "google_client_secret": "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",
    "google_redirect_uri": "http://localhost:8000/auth/google/callback",
    "google_scopes": "openid email profile",
    "microsoft_client_id": "bb0376c9-a26b-4ce1-8b6d-1c333fda6209",
    "microsoft_client_secret": "4da9bfbc-4a5f-4368-b7bb-484613faeda4",
    "microsoft_redirect_uri": "http://localhost:8000/auth/microsoft/callback",
    "microsoft_scopes": "openid email profile User.Read",
    "microsoft_tenant": "common",
}

# Database configuration is now centralized in app.db_config
