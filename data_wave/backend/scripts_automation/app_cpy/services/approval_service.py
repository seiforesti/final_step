"""
Enterprise Approval Service
Provides DB-backed approval workflows with timeouts, escalations, and notifications.
Integrates with workflow and collaboration approval models when present.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import logging

from sqlmodel import select

try:
    # Primary approval model within scan workflows
    from app.models.scan_workflow_models import WorkflowApproval, ApprovalStatus, ApprovalType
except Exception:  # pragma: no cover - model may not exist in all deployments
    WorkflowApproval = None  # type: ignore
    ApprovalStatus = None  # type: ignore
    ApprovalType = None  # type: ignore

try:
    # Advanced collaboration approval workflow (fallback/extended)
    from app.models.Scan_Rule_Sets_completed_models.advanced_collaboration_models import (
        ApprovalWorkflow as CollaborationApprovalWorkflow,
    )
except Exception:  # pragma: no cover
    CollaborationApprovalWorkflow = None  # type: ignore

try:
    from app.services.notification_service import NotificationService
except Exception:  # pragma: no cover
    NotificationService = None  # type: ignore

try:
    from app.db_session import get_session as get_sync_session
except Exception:  # pragma: no cover
    get_sync_session = None  # type: ignore

logger = logging.getLogger(__name__)


class ApprovalService:
    """Enterprise-grade approval workflow service."""

    def __init__(self) -> None:
        self.notifier = NotificationService() if NotificationService else None

    async def create_approval_request(
        self,
        request_id: str,
        workflow_id: str,
        approvers: List[str],
        payload: Optional[Dict[str, Any]] = None,
        required_approvals: Optional[int] = None,
        due_in_hours: int = 24,
    ) -> Dict[str, Any]:
        """Create a new approval request and persist it.

        Tries `WorkflowApproval` first; falls back to collaboration `ApprovalWorkflow` if needed.
        """
        try:
            if not get_sync_session:
                raise RuntimeError("Database session manager is not available")

            with get_sync_session() as session:
                now = datetime.utcnow()
                due_date = now + timedelta(hours=max(1, due_in_hours))

                if WorkflowApproval is not None:
                    # Create or upsert workflow approval
                    required = required_approvals or max(1, len(approvers))
                    row = WorkflowApproval(
                        approval_id=request_id,
                        workflow_id=workflow_id,
                        approval_type=ApprovalType.SEQUENTIAL if len(approvers) > 1 else ApprovalType.SINGLE,
                        approval_name=f"Approval for {workflow_id}",
                        description=(payload or {}).get("description", ""),
                        required_approvers=approvers,
                        approved_by=[],
                        rejected_by=[],
                        status=ApprovalStatus.PENDING,
                        required_approvals=required,
                        current_approvals=0,
                        requested_at=now,
                        due_date=due_date,
                        approval_criteria=(payload or {}).get("criteria", {}),
                        approval_notes=(payload or {}).get("notes"),
                    )
                    session.add(row)
                    session.commit()
                elif CollaborationApprovalWorkflow is not None:
                    # Fallback: create a collaboration approval workflow entry
                    row = CollaborationApprovalWorkflow(
                        workflow_name=f"Approval for {workflow_id}",
                        workflow_description=(payload or {}).get("description", ""),
                        workflow_type="sequential" if len(approvers) > 1 else "single",
                        approval_stages=[{"name": "approval", "approvers": approvers, "required": True}],
                        current_stage=0,
                        total_stages=1,
                        status="pending",
                        initiator=(payload or {}).get("initiator", "system"),
                        approvers={"0": {"stage": "approval", "approvers": approvers}},
                        current_approvers=approvers,
                        stage_deadlines={"0": due_date},
                    )
                    session.add(row)
                    session.commit()
                else:
                    raise RuntimeError("No approval models available to persist request")

            # Notify approvers
            await self._notify(
                recipients=approvers,
                title="Approval Requested",
                message=f"Approval required for workflow {workflow_id} (request {request_id}).",
                priority="high",
                metadata={"workflow_id": workflow_id, "approval_id": request_id},
            )

            return {"approval_id": request_id, "status": "pending", "due_date": due_date.isoformat()}

        except Exception as e:
            logger.error(f"Failed to create approval request: {e}")
            raise

    async def approve_request(self, approval_id: str, approver_id: str, note: Optional[str] = None) -> Dict[str, Any]:
        """Approve an existing request; finalize when thresholds are met."""
        try:
            if not get_sync_session:
                raise RuntimeError("Database session manager is not available")

            with get_sync_session() as session:
                if WorkflowApproval is not None:
                    row = session.execute(select(WorkflowApproval).where(WorkflowApproval.approval_id == approval_id)).first()
                    if not row:
                        raise ValueError("Approval not found")
                    if getattr(row, "status", None) != ApprovalStatus.PENDING:
                        return {"approval_id": approval_id, "status": str(row.status)}

                    approved_by = set(row.approved_by or [])
                    approved_by.add(str(approver_id))
                    row.approved_by = list(approved_by)
                    row.current_approvals = len(row.approved_by)

                    # Finalize when enough approvals
                    if row.current_approvals >= max(1, row.required_approvals or 1):
                        row.status = ApprovalStatus.APPROVED
                        row.completed_at = datetime.utcnow()
                    session.add(row)
                    session.commit()
                    status_value = str(row.status)
                elif CollaborationApprovalWorkflow is not None:
                    # Minimal support: mark decision history and set status
                    row = session.execute(select(CollaborationApprovalWorkflow).where(CollaborationApprovalWorkflow.workflow_id == approval_id)).first()
                    if not row:
                        raise ValueError("Approval workflow not found")
                    decisions = row.stage_decisions or {}
                    stage_key = str(row.current_stage)
                    stage_dec = decisions.get(stage_key, {"approvals": [], "rejections": []})
                    stage_dec["approvals"].append({"user": approver_id, "note": note, "time": datetime.utcnow().isoformat()})
                    decisions[stage_key] = stage_dec
                    row.stage_decisions = decisions
                    row.status = "approved"
                    row.completed_approvals = (row.completed_approvals or {})
                    row.completed_approvals[stage_key] = row.completed_approvals.get(stage_key, 0) + 1
                    row.completed_at = datetime.utcnow()
                    session.add(row)
                    session.commit()
                    status_value = "approved"
                else:
                    raise RuntimeError("No approval models available to approve")

            await self._notify(
                recipients=[approver_id],
                title="Approval Submitted",
                message=f"Your approval for {approval_id} has been recorded.",
                priority="normal",
                metadata={"approval_id": approval_id},
            )
            return {"approval_id": approval_id, "status": status_value}

        except Exception as e:
            logger.error(f"Failed to approve request: {e}")
            raise

    async def reject_request(self, approval_id: str, approver_id: str, reason: Optional[str] = None) -> Dict[str, Any]:
        """Reject an existing request."""
        try:
            if not get_sync_session:
                raise RuntimeError("Database session manager is not available")

            with get_sync_session() as session:
                if WorkflowApproval is not None:
                    row = session.execute(select(WorkflowApproval).where(WorkflowApproval.approval_id == approval_id)).first()
                    if not row:
                        raise ValueError("Approval not found")
                    row.rejected_by = list(set((row.rejected_by or []) + [str(approver_id)]))
                    row.status = ApprovalStatus.REJECTED
                    row.rejection_reason = reason or row.rejection_reason
                    row.completed_at = datetime.utcnow()
                    session.add(row)
                    session.commit()
                    status_value = str(row.status)
                elif CollaborationApprovalWorkflow is not None:
                    row = session.execute(select(CollaborationApprovalWorkflow).where(CollaborationApprovalWorkflow.workflow_id == approval_id)).first()
                    if not row:
                        raise ValueError("Approval workflow not found")
                    decisions = row.stage_decisions or {}
                    stage_key = str(row.current_stage)
                    stage_dec = decisions.get(stage_key, {"approvals": [], "rejections": []})
                    stage_dec["rejections"].append({"user": approver_id, "reason": reason, "time": datetime.utcnow().isoformat()})
                    decisions[stage_key] = stage_dec
                    row.stage_decisions = decisions
                    row.status = "rejected"
                    row.completed_at = datetime.utcnow()
                    session.add(row)
                    session.commit()
                    status_value = "rejected"
                else:
                    raise RuntimeError("No approval models available to reject")

            await self._notify(
                recipients=[approver_id],
                title="Approval Rejected",
                message=f"You rejected approval {approval_id}.",
                priority="normal",
                metadata={"approval_id": approval_id, "reason": reason or ""},
            )
            return {"approval_id": approval_id, "status": status_value}

        except Exception as e:
            logger.error(f"Failed to reject request: {e}")
            raise

    async def get_pending_approvals(self, approver_id: str) -> List[Dict[str, Any]]:
        """List pending approvals for a given approver."""
        try:
            if not get_sync_session:
                return []
            with get_sync_session() as session:
                results: List[Dict[str, Any]] = []
                if WorkflowApproval is not None:
                    stmt = select(WorkflowApproval)
                    rows = session.execute(stmt).scalars().all()
                    for row in rows:
                        reqd = set(row.required_approvers or [])
                        if str(approver_id) in reqd and str(getattr(row, "status", "").lower()) == str(ApprovalStatus.PENDING.value if hasattr(ApprovalStatus, 'PENDING') else 'pending'):
                            results.append({
                                "approval_id": row.approval_id,
                                "workflow_id": row.workflow_id,
                                "due_date": row.due_date,
                                "required_approvals": row.required_approvals,
                                "current_approvals": row.current_approvals,
                            })
                elif CollaborationApprovalWorkflow is not None:
                    rows = session.execute(select(CollaborationApprovalWorkflow)).all()
                    for row in rows:
                        current = row.current_stage or 0
                        cur_cfg = (row.approvers or {}).get(str(current), {})
                        cur_approvers = set((cur_cfg or {}).get("approvers", []))
                        if str(approver_id) in cur_approvers and str(getattr(row, "status", "").lower()) in ("pending", "draft"):
                            results.append({
                                "approval_workflow_id": row.workflow_id,
                                "current_stage": current,
                                "due_date": (row.stage_deadlines or {}).get(str(current)),
                            })
                return results
        except Exception as e:
            logger.error(f"Failed to list pending approvals: {e}")
            return []

    async def _notify(self, recipients: List[str], title: str, message: str, priority: str = "normal", metadata: Optional[Dict[str, Any]] = None) -> None:
        if not self.notifier or not recipients:
            return
        try:
            await self.notifier.send_notification(
                notification_type="approval",
                message=message,
                recipients=recipients,
                priority=priority,
                metadata={"title": title, **(metadata or {})}
            )
        except Exception as e:  # pragma: no cover
            logger.warning(f"Approval notification failed: {e}")


