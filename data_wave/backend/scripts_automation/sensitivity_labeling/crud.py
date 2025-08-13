from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional
from datetime import datetime

def create_label(db: Session, label: schemas.SensitivityLabelCreate) -> models.SensitivityLabel:
    db_label = models.SensitivityLabel(**label.dict())
    db.add(db_label)
    db.commit()
    db.refresh(db_label)
    return db_label

def get_label(db: Session, label_id: int) -> Optional[models.SensitivityLabel]:
    return db.query(models.SensitivityLabel).filter(models.SensitivityLabel.id == label_id).first()

def get_labels(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    scopes: Optional[list] = None,
    colors: Optional[list] = None,
    conditional_only: Optional[bool] = False,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> List[models.SensitivityLabel]:
    query = db.query(models.SensitivityLabel)
    if search:
        query = query.filter(
            (models.SensitivityLabel.name.ilike(f"%{search}%")) |
            (models.SensitivityLabel.description.ilike(f"%{search}%"))
        )
    if scopes:
        query = query.filter(models.SensitivityLabel.applies_to.in_(scopes))
    if colors:
        query = query.filter(models.SensitivityLabel.color.in_(colors))
    if conditional_only:
        query = query.filter(models.SensitivityLabel.is_conditional.is_(True))
    if date_from:
        query = query.filter(models.SensitivityLabel.created_at >= date_from)
    if date_to:
        query = query.filter(models.SensitivityLabel.created_at <= date_to)
    return query.offset(skip).limit(limit).all()

def create_proposal(db: Session, proposal: schemas.LabelProposalCreate) -> models.LabelProposal:
    db_proposal = models.LabelProposal(**proposal.dict())
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    return db_proposal

def get_proposals(db: Session, object_type: str = None, object_id: str = None, status: models.LabelStatus = None) -> List[models.LabelProposal]:
    query = db.query(models.LabelProposal)
    if object_type:
        query = query.filter(models.LabelProposal.object_type == object_type)
    if object_id:
        query = query.filter(models.LabelProposal.object_id == object_id)
    if status:
        query = query.filter(models.LabelProposal.status == status)
    return query.all()

def update_proposal_status(db: Session, proposal_id: int, status: models.LabelStatus) -> Optional[models.LabelProposal]:
    proposal = db.query(models.LabelProposal).filter(models.LabelProposal.id == proposal_id).first()
    if proposal:
        proposal.status = status
        proposal.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(proposal)
    return proposal

def create_audit(db: Session, audit: schemas.LabelAuditCreate) -> models.LabelAudit:
    db_audit = models.LabelAudit(**audit.dict())
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return db_audit

def create_review(db: Session, review: schemas.LabelReviewCreate) -> models.LabelReview:
    db_review = models.LabelReview(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_reviews(db: Session, proposal_id: int) -> List[models.LabelReview]:
    return db.query(models.LabelReview).filter(models.LabelReview.proposal_id == proposal_id).all()

def get_label_audit(db: Session, label_id: int):
    return db.query(models.LabelAudit).filter(models.LabelAudit.label_id == label_id).order_by(models.LabelAudit.timestamp.desc()).all()

def get_label_ml_suggestions(db: Session, label_id: int):
    return db.query(models.MLSuggestion).filter(models.MLSuggestion.label_id == label_id).order_by(models.MLSuggestion.confidence.desc()).all()

def add_lineage_edge(db, source_type, source_id, target_type, target_id, relationship_type="data_flow"):
    from .models import LineageEdge
    edge = LineageEdge(
        source_type=source_type,
        source_id=source_id,
        target_type=target_type,
        target_id=target_id,
        relationship_type=relationship_type
    )
    db.add(edge)
    db.commit()
    db.refresh(edge)
    return edge

def get_lineage(db, object_type, object_id, direction="both"):
    from .models import LineageEdge
    q = db.query(LineageEdge)
    if direction == "upstream":
        q = q.filter(LineageEdge.target_type == object_type, LineageEdge.target_id == object_id)
    elif direction == "downstream":
        q = q.filter(LineageEdge.source_type == object_type, LineageEdge.source_id == object_id)
    else:  # both
        q = q.filter(
            (LineageEdge.source_type == object_type) & (LineageEdge.source_id == object_id) |
            (LineageEdge.target_type == object_type) & (LineageEdge.target_id == object_id)
        )
    return q.all()

def get_impact(db, object_type, object_id):
    from .models import LineageEdge
    # For now, just return all downstream edges (could be recursive for full impact)
    q = db.query(LineageEdge).filter(LineageEdge.source_type == object_type, LineageEdge.source_id == object_id)
    return q.all()

def get_lineage_recursive(db, object_type, object_id, direction="both", visited=None):
    from .models import LineageEdge
    if visited is None:
        visited = set()
    key = (object_type, object_id)
    if key in visited:
        return []
    visited.add(key)
    edges = []
    if direction in ("downstream", "both"):
        ds_edges = db.query(LineageEdge).filter(LineageEdge.source_type == object_type, LineageEdge.source_id == object_id).all()
        edges.extend(ds_edges)
        for e in ds_edges:
            edges.extend(get_lineage_recursive(db, e.target_type, e.target_id, "downstream", visited))
    if direction in ("upstream", "both"):
        us_edges = db.query(LineageEdge).filter(LineageEdge.target_type == object_type, LineageEdge.target_id == object_id).all()
        edges.extend(us_edges)
        for e in us_edges:
            edges.extend(get_lineage_recursive(db, e.source_type, e.source_id, "upstream", visited))
    return edges

def get_impact_recursive(db, object_type, object_id, visited=None):
    from .models import LineageEdge
    if visited is None:
        visited = set()
    key = (object_type, object_id)
    if key in visited:
        return []
    visited.add(key)
    edges = db.query(LineageEdge).filter(LineageEdge.source_type == object_type, LineageEdge.source_id == object_id).all()
    all_edges = list(edges)
    for e in edges:
        all_edges.extend(get_impact_recursive(db, e.target_type, e.target_id, visited))
    return all_edges

def list_audits(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user: str = None,
    entity_type: str = None,
    entity_id: int = None,
    action: str = None,
    start_date: str = None,
    end_date: str = None,
):
    q = db.query(models.LabelAudit)
    if user:
        q = q.filter(models.LabelAudit.performed_by == user)
    if action:
        q = q.filter(models.LabelAudit.action == action)
    if start_date:
        q = q.filter(models.LabelAudit.timestamp >= start_date)
    if end_date:
        q = q.filter(models.LabelAudit.timestamp <= end_date)
    # Entity filtering: join with proposal if needed
    if entity_type or entity_id:
        q = q.join(models.LabelProposal)
        if entity_type:
            q = q.filter(models.LabelProposal.object_type == entity_type)
        if entity_id:
            q = q.filter(models.LabelProposal.object_id == str(entity_id))
    q = q.order_by(models.LabelAudit.timestamp.desc())
    return q.offset(skip).limit(limit).all()

def export_audits(
    db: Session,
    user: str = None,
    entity_type: str = None,
    entity_id: int = None,
    action: str = None,
    start_date: str = None,
    end_date: str = None,
    format: str = "csv"
):
    audits = list_audits(
        db,
        skip=0,
        limit=10000,  # Export up to 10k events at once
        user=user,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        start_date=start_date,
        end_date=end_date,
    )
    if format == "json":
        return [a.__dict__ for a in audits]
    # CSV export
    import csv
    from io import StringIO
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "timestamp", "user", "action", "entity_type", "entity_id", "details"])
    for a in audits:
        writer.writerow([
            a.id,
            getattr(a, "timestamp", None),
            getattr(a, "performed_by", None),
            getattr(a, "action", None),
            getattr(a.proposal, "object_type", None) if hasattr(a, "proposal") else None,
            getattr(a.proposal, "object_id", None) if hasattr(a, "proposal") else None,
            getattr(a, "note", None)
        ])
    return output.getvalue()

def get_audit_detail(db: Session, audit_id: int):
    return db.query(models.LabelAudit).filter(models.LabelAudit.id == audit_id).first()

def get_review_by_id(db: Session, review_id: int):
    return db.query(models.LabelReview).filter(models.LabelReview.id == review_id).first()

def complete_review(db: Session, review_id: int, note: str = None):
    review = get_review_by_id(db, review_id)
    if not review:
        return None
    review.review_status = models.LabelStatus.APPROVED.value
    if note:
        review.review_note = note
    review.completed_date = datetime.utcnow()  # <-- set completed_date
    db.commit()
    db.refresh(review)
    return review

def escalate_review(db: Session, review_id: int, note: str = None):
    review = get_review_by_id(db, review_id)
    if not review:
        return None
    review.review_status = "escalated"
    if note:
        review.review_note = note
    db.commit()
    db.refresh(review)
    return review

def bulk_review(db: Session, review_ids: list, action: str, note: str = None, user_email: str = None):
    reviews = db.query(models.LabelReview).filter(models.LabelReview.id.in_(review_ids)).all()
    for review in reviews:
        if action == "approve":
            review.review_status = models.LabelStatus.APPROVED.value
            review.completed_date = datetime.utcnow()  # <-- set completed_date
        elif action == "reject":
            review.review_status = models.LabelStatus.REJECTED.value
            review.completed_date = datetime.utcnow()  # <-- set completed_date
        if note:
            review.review_note = note
        review.review_date = datetime.utcnow()
    db.commit()
    return reviews

def assign_review(db: Session, review_id: int, assignee: str):
    review = get_review_by_id(db, review_id)
    if not review:
        return None
    review.reviewer = assignee
    db.commit()
    db.refresh(review)
    return review

def add_review_comment(db: Session, review_id: int, comment: str, user_email: str):
    review = get_review_by_id(db, review_id)
    if not review:
        return None
    # Append comment to review_note (could be improved with a separate comments table)
    if review.review_note:
        review.review_note += f"\n[{user_email}] {comment}"
    else:
        review.review_note = f"[{user_email}] {comment}"
    db.commit()
    db.refresh(review)
    return review

def delete_label(db: Session, label_id: int):
    """
    Delete a sensitivity label by ID.
    """
    label = db.query(models.SensitivityLabel).filter(models.SensitivityLabel.id == label_id).first()
    if label:
        db.delete(label)
        db.commit()
        return True
    return False

def delete_proposal(db: Session, proposal_id: int):
    """
    Delete a label proposal by ID.
    """
    proposal = db.query(models.LabelProposal).filter(models.LabelProposal.id == proposal_id).first()
    if proposal:
        db.delete(proposal)
        db.commit()
        return True
    return False

def get_object_metadata(db: Session, object_id: str):
    """
    Fetch metadata for a given object_id (column/table).
    Tries to find as a SensitivityLabel or LabelProposal, else returns a mock.
    """
    label = db.query(models.SensitivityLabel).filter(models.SensitivityLabel.name == object_id).first()
    if label:
        return {
            "name": label.name,
            "type": label.applies_to,
            "unique_count": 100,
            "total_count": 1000,
            "null_count": 10,
            "mean": 0.0,
            "std": 1.0,
            "proposal_count": len(label.proposals) if hasattr(label, 'proposals') else 0,
            "review_count": 0
        }
    proposal = db.query(models.LabelProposal).filter(models.LabelProposal.object_id == object_id).first()
    if proposal:
        return {
            "name": proposal.object_id,
            "type": proposal.object_type,
            "unique_count": 100,
            "total_count": 1000,
            "null_count": 10,
            "mean": 0.0,
            "std": 1.0,
            "proposal_count": 1,
            "review_count": len(proposal.reviews) if hasattr(proposal, 'reviews') else 0
        }
    # Fallback mock
    return {
        "name": object_id,
        "type": "string",
        "unique_count": 100,
        "total_count": 1000,
        "null_count": 10,
        "mean": 0.0,
        "std": 1.0,
        "proposal_count": 2,
        "review_count": 1
    }
