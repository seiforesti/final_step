from sqlalchemy.orm import Session
from typing import Optional, List
from . import models, schemas, crud
from app.models.auth_models import User
from datetime import datetime
import asyncio
from .realtime_events import notify_realtime_event
from app.services.email_service import send_email
from .notification_job import send_notification

# Configurable consensus rules
REQUIRED_APPROVALS = 2
REQUIRED_REJECTIONS = 1

class WorkflowError(Exception):
    pass

def vote_on_proposal(
    db: Session,
    proposal_id: int,
    reviewer: User,
    approve: bool,
    review_note: Optional[str] = None
) -> models.LabelProposal:
    proposal = crud.get_proposals(db, status=None)
    proposal = next((p for p in proposal if p.id == proposal_id), None)
    if not proposal:
        raise WorkflowError("Proposal not found")
    # Prevent duplicate reviews by same reviewer
    existing_reviews = crud.get_reviews(db, proposal_id)
    if any(r.reviewer == reviewer.email for r in existing_reviews):
        raise WorkflowError("Reviewer has already voted")
    # Record review
    review_status = models.LabelStatus.APPROVED if approve else models.LabelStatus.REJECTED
    crud.create_review(db, schemas.LabelReviewCreate(
        proposal_id=proposal_id,
        reviewer=reviewer.email,
        review_status=review_status,
        review_note=review_note
    ))
    # Audit log
    crud.create_audit(db, schemas.LabelAuditCreate(
        proposal_id=proposal_id,
        action="approved" if approve else "rejected",
        performed_by=reviewer.email,
        note=review_note
    ))
    # Check for consensus
    reviews = crud.get_reviews(db, proposal_id)
    approvals = [r for r in reviews if r.review_status == models.LabelStatus.APPROVED]
    rejections = [r for r in reviews if r.review_status == models.LabelStatus.REJECTED]
    if len(approvals) >= REQUIRED_APPROVALS:
        crud.update_proposal_status(db, proposal_id, models.LabelStatus.APPROVED)
        crud.create_audit(db, schemas.LabelAuditCreate(
            proposal_id=proposal_id,
            action="final_approved",
            performed_by=reviewer.email,
            note="Consensus reached: approved"
        ))
        notify_label_approved(proposal, [proposal.proposed_by])
        # Real-time event
        asyncio.create_task(notify_realtime_event({
            "event": "proposal_approved",
            "proposal_id": proposal_id,
            "object_type": proposal.object_type,
            "object_id": proposal.object_id,
            "status": "approved"
        }))
        # Notify stakeholders of approval
        subject = f"Label Approved: {proposal.label_id} for {proposal.object_type} {proposal.object_id}"
        message = f"Your proposal has been approved."
        asyncio.create_task(send_notification(proposal.proposed_by, subject, message))
        # Notify all reviewers (if needed)
        for review in crud.get_reviews(db, proposal_id):
            asyncio.create_task(send_notification(review.reviewer, subject, message))
    elif len(rejections) >= REQUIRED_REJECTIONS:
        crud.update_proposal_status(db, proposal_id, models.LabelStatus.REJECTED)
        crud.create_audit(db, schemas.LabelAuditCreate(
            proposal_id=proposal_id,
            action="final_rejected",
            performed_by=reviewer.email,
            note="Consensus reached: rejected"
        ))
        notify_label_rejected(proposal, [proposal.proposed_by])
        # Real-time event
        asyncio.create_task(notify_realtime_event({
            "event": "proposal_rejected",
            "proposal_id": proposal_id,
            "object_type": proposal.object_type,
            "object_id": proposal.object_id,
            "status": "rejected"
        }))
        # Notify stakeholders of rejection
        subject = f"Label Rejected: {proposal.label_id} for {proposal.object_type} {proposal.object_id}"
        message = f"Your proposal has been rejected."
        asyncio.create_task(send_notification(proposal.proposed_by, subject, message))
        for review in crud.get_reviews(db, proposal_id):
            asyncio.create_task(send_notification(review.reviewer, subject, message))
    # Return updated proposal
    updated = crud.get_proposals(db, status=None)
    return next((p for p in updated if p.id == proposal_id), None)

def get_proposal_status(db: Session, proposal_id: int) -> models.LabelProposal:
    proposal = crud.get_proposals(db, status=None)
    proposal = next((p for p in proposal if p.id == proposal_id), None)
    if not proposal:
        raise WorkflowError("Proposal not found")
    return proposal

# --- Notification Hooks (Stubs) ---
def notify_label_approved(proposal, users: list):
    subject = f"Label Approved: {proposal.label_id} for {proposal.object_type} {proposal.object_id}"
    body = f"Your label proposal (ID: {proposal.id}) has been approved.\n\nLabel: {proposal.label_id}\nObject: {proposal.object_type} {proposal.object_id}\nStatus: APPROVED"
    for user_email in users:
        send_email(user_email, subject, body)

def notify_label_rejected(proposal, users: list):
    subject = f"Label Rejected: {proposal.label_id} for {proposal.object_type} {proposal.object_id}"
    body = f"Your label proposal (ID: {proposal.id}) has been rejected.\n\nLabel: {proposal.label_id}\nObject: {proposal.object_type} {proposal.object_id}\nStatus: REJECTED"
    for user_email in users:
        send_email(user_email, subject, body)

def notify_label_expiry(proposal, users: list):
    subject = f"Label Expiry Notice: {proposal.label_id} for {proposal.object_type} {proposal.object_id}"
    body = f"Your label proposal (ID: {proposal.id}) is expiring soon.\n\nLabel: {proposal.label_id}\nObject: {proposal.object_type} {proposal.object_id}\nStatus: EXPIRING"
    for user_email in users:
        send_email(user_email, subject, body)

# Example usage in vote_on_proposal (after consensus):
# if len(approvals) >= REQUIRED_APPROVALS:
#     notify_label_approved(proposal, [proposal.proposed_by])
# elif len(rejections) >= REQUIRED_REJECTIONS:
#     notify_label_rejected(proposal, [proposal.proposed_by])
