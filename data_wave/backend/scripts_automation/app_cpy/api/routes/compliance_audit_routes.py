from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from app.db_session import get_session
from app.services.compliance_production_services import ComplianceAuditService
from app.models.compliance_extended_models import ComplianceAuditLog

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/audit", tags=["Compliance Audit"])

@router.get("/{entity_type}/{entity_id}", response_model=Dict[str, Any])
async def get_audit_trail(
    entity_type: str,
    entity_id: str,
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    date_from: Optional[str] = Query(None, description="Start date filter"),
    date_to: Optional[str] = Query(None, description="End date filter"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get audit trail for a specific entity"""
    try:
        # Build query filters
        query = select(ComplianceAuditLog).where(
            ComplianceAuditLog.entity_type == entity_type,
            ComplianceAuditLog.entity_id == entity_id
        )
        
        filters = []
        
        if action_type:
            filters.append(ComplianceAuditLog.action == action_type)
        if user_id:
            filters.append(ComplianceAuditLog.user_id == user_id)
        if date_from:
            try:
                date_from_dt = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                filters.append(ComplianceAuditLog.timestamp >= date_from_dt)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_from format")
        if date_to:
            try:
                date_to_dt = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                filters.append(ComplianceAuditLog.timestamp <= date_to_dt)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_to format")
        
        if filters:
            query = query.where(and_(*filters))
        
        # Apply pagination
        offset = (page - 1) * limit
        audit_logs = session.execute(
            query.order_by(ComplianceAuditLog.timestamp.desc())
            .offset(offset)
            .limit(limit)
        ).all()
        
        # Count total
        count_query = select(func.count(ComplianceAuditLog.id)).where(
            ComplianceAuditLog.entity_type == entity_type,
            ComplianceAuditLog.entity_id == entity_id
        )
        if filters:
            count_query = count_query.where(and_(*filters))
        
        total = session.execute(count_query).one()
        
        # Format audit trail data
        audit_data = []
        for log in audit_logs:
            audit_item = {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "action": log.action,
                "user_id": log.user_id,
                "user_name": log.user_name,
                "session_id": log.session_id,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "old_values": log.old_values,
                "new_values": log.new_values,
                "change_summary": log.change_summary,
                "impact_level": log.impact_level,
                "metadata": log.metadata
            }
            audit_data.append(audit_item)
        
        return {
            "data": audit_data,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "filters": {
                "action_type": action_type,
                "user_id": user_id,
                "date_from": date_from,
                "date_to": date_to
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting audit trail for {entity_type}/{entity_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{entity_type}/{entity_id}/summary", response_model=Dict[str, Any])
async def get_audit_summary(
    entity_type: str,
    entity_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    session: Session = Depends(get_session)
):
    """Get audit trail summary for a specific entity"""
    try:
        since_date = datetime.now() - timedelta(days=days)
        
        # Get audit statistics
        base_query = select(ComplianceAuditLog).where(
            ComplianceAuditLog.entity_type == entity_type,
            ComplianceAuditLog.entity_id == entity_id,
            ComplianceAuditLog.timestamp >= since_date
        )
        
        # Total actions
        total_actions = session.execute(
            select(func.count(ComplianceAuditLog.id)).where(
                ComplianceAuditLog.entity_type == entity_type,
                ComplianceAuditLog.entity_id == entity_id,
                ComplianceAuditLog.timestamp >= since_date
            )
        ).one()
        
        # Actions by type
        actions_by_type = session.execute(
            select(ComplianceAuditLog.action, func.count(ComplianceAuditLog.id))
            .where(
                ComplianceAuditLog.entity_type == entity_type,
                ComplianceAuditLog.entity_id == entity_id,
                ComplianceAuditLog.timestamp >= since_date
            )
            .group_by(ComplianceAuditLog.action)
        ).all()
        
        # Actions by user
        actions_by_user = session.execute(
            select(ComplianceAuditLog.user_id, ComplianceAuditLog.user_name, func.count(ComplianceAuditLog.id))
            .where(
                ComplianceAuditLog.entity_type == entity_type,
                ComplianceAuditLog.entity_id == entity_id,
                ComplianceAuditLog.timestamp >= since_date
            )
            .group_by(ComplianceAuditLog.user_id, ComplianceAuditLog.user_name)
        ).all()
        
        # Recent activities
        recent_activities = session.execute(
            base_query.order_by(ComplianceAuditLog.timestamp.desc()).limit(10)
        ).all()
        
        return {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "period_days": days,
            "summary": {
                "total_actions": total_actions,
                "actions_by_type": [{"action": action, "count": count} for action, count in actions_by_type],
                "actions_by_user": [{"user_id": user_id, "user_name": user_name, "count": count} 
                                  for user_id, user_name, count in actions_by_user],
                "unique_users": len(actions_by_user),
                "period_start": since_date.isoformat(),
                "period_end": datetime.now().isoformat()
            },
            "recent_activities": [
                {
                    "timestamp": log.timestamp.isoformat(),
                    "action": log.action,
                    "user_name": log.user_name,
                    "change_summary": log.change_summary
                }
                for log in recent_activities
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting audit summary for {entity_type}/{entity_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))