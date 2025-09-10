### === backend/app/core/security.py ===
from pyapacheatlas.auth import ServicePrincipalAuthentication, BasicAuthentication
from app.core.config import settings


def get_auth():
    if settings.AUTH_TYPE == "serviceprincipal":
        return ServicePrincipalAuthentication(
            tenant_id=settings.TENANT_ID,
            client_id=settings.CLIENT_ID,
            client_secret=settings.CLIENT_SECRET
        )
    elif settings.AUTH_TYPE == "basic":
        return BasicAuthentication(
            username=settings.CLIENT_ID,
            password=settings.CLIENT_SECRET
        )
    else:
        raise ValueError("Unsupported AUTH_TYPE. Use 'serviceprincipal' or 'basic'.")
