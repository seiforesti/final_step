"""
Enterprise AuditService
Central audit logging utility used by compliance and orchestration services.
"""

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

from sqlmodel import select, Session

from ..db_session import get_session
from ..models.compliance_extended_models import ComplianceAuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """Enterprise audit logging service."""

    async def create_audit_log(
        self,
        session: Optional[Session] = None,
        audit_data: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Persist an audit log entry to `compliance_audit_logs`.
        Accepts an optional external session; otherwise uses its own.
        """
        audit_data = audit_data or {}
        should_close = False
        try:
            if session is None:
                session = get_session()
                should_close = True

            log = ComplianceAuditLog(
                entity_type=str(audit_data.get("entity_type", "report")),
                entity_id=int(audit_data.get("report_id", audit_data.get("entity_id", 0)) or 0),
                action=str(audit_data.get("action", "unknown")),
                user_id=user_id or audit_data.get("user_id"),
                user_email=audit_data.get("user_email"),
                session_id=audit_data.get("session_id"),
                ip_address=audit_data.get("ip_address"),
                user_agent=audit_data.get("user_agent"),
                old_values=audit_data.get("old_values"),
                new_values=audit_data.get("new_values"),
                changes=audit_data.get("changes"),
                description=audit_data.get("description"),
                reason=audit_data.get("reason"),
                impact_level=str(audit_data.get("impact_level", "low")),
                system_version=audit_data.get("system_version"),
                request_id=audit_data.get("request_id"),
                correlation_id=audit_data.get("correlation_id"),
                audit_metadata=dict(audit_data),
                created_at=datetime.utcnow(),
            )

            session.add(log)
            session.commit()
            session.refresh(log)

            return {"success": True, "id": log.id}

        except Exception as exc:
            logger.error(f"create_audit_log failed: {exc}")
            if session is not None:
                session.rollback()
            return {"success": False, "error": str(exc)}
        finally:
            if should_close and session is not None:
                session.close()

    async def get_audit_history(
        self,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Return recent audit entries for an entity."""
        try:
            with get_session() as session:
                stmt = select(ComplianceAuditLog).order_by(ComplianceAuditLog.created_at.desc())
                if entity_type:
                    stmt = stmt.where(ComplianceAuditLog.entity_type == entity_type)
                if entity_id is not None:
                    stmt = stmt.where(ComplianceAuditLog.entity_id == entity_id)
                rows = session.exec(stmt.limit(limit)).all() or []
                return [
                    {
                        "id": r.id,
                        "entity_type": r.entity_type,
                        "entity_id": r.entity_id,
                        "action": r.action,
                        "created_at": r.created_at.isoformat() if r.created_at else None,
                        "user_id": r.user_id,
                        "impact_level": r.impact_level,
                        "description": r.description,
                    }
                    for r in rows
                ]
        except Exception as exc:
            logger.error(f"get_audit_history failed: {exc}")
            return []

"""Audit Service"""

