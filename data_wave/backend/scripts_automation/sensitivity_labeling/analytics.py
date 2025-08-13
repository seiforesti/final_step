from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from . import crud, models
from app.db_session import get_session
from datetime import datetime, timedelta
from sqlalchemy import func

router = APIRouter(prefix="/sensitivity-labels/analytics", tags=["Sensitivity Analytics"])

@router.get("/coverage", response_model=Dict[str, Any])
def get_labeling_coverage(db: Session = Depends(get_session)):
    """Return labeling coverage stats by object type and user."""
    total_objects = db.query(models.LabelProposal.object_type, models.LabelProposal.object_id).distinct().count()
    labeled_objects = db.query(models.LabelProposal.object_type, models.LabelProposal.object_id).filter(models.LabelProposal.status == models.LabelStatus.APPROVED).distinct().count()
    coverage_percent = (labeled_objects / total_objects * 100) if total_objects else 0.0
    return {
        "total_objects": total_objects,
        "labeled_objects": labeled_objects,
        "coverage_percent": coverage_percent
    }

@router.get("/pending-reviews", response_model=List[Dict[str, Any]])
def get_pending_reviews(db: Session = Depends(get_session)):
    """Return proposals pending review, with days since proposal."""
    pending = db.query(models.LabelProposal).filter(models.LabelProposal.status == models.LabelStatus.PROPOSED).all()
    return [
        {
            "id": p.id,
            "object_type": p.object_type,
            "object_id": p.object_id,
            "label_id": p.label_id,
            "proposed_by": p.proposed_by,
            "created_at": p.created_at,
            "days_pending": (datetime.utcnow() - p.created_at).days
        }
        for p in pending
    ]

@router.get("/expiring-labels", response_model=List[Dict[str, Any]])
def get_expiring_labels(db: Session = Depends(get_session)):
    """Return labels with expiry date within next 30 days."""
    soon = datetime.utcnow() + timedelta(days=30)
    expiring = db.query(models.LabelProposal).filter(
        models.LabelProposal.expiry_date != None,
        models.LabelProposal.expiry_date <= soon,
        models.LabelProposal.status == models.LabelStatus.APPROVED
    ).all()
    return [
        {
            "id": p.id,
            "object_type": p.object_type,
            "object_id": p.object_id,
            "label_id": p.label_id,
            "expiry_date": p.expiry_date,
            "proposed_by": p.proposed_by
        }
        for p in expiring
    ]

@router.get("/label-usage", response_model=List[Dict[str, Any]])
def get_label_usage_stats(db: Session = Depends(get_session)):
    """Return usage stats for each label (count, last used)."""
    labels = db.query(models.SensitivityLabel).all()
    stats = []
    for label in labels:
        count = db.query(models.LabelProposal).filter(models.LabelProposal.label_id == label.id).count()
        last = db.query(models.LabelProposal).filter(models.LabelProposal.label_id == label.id).order_by(models.LabelProposal.updated_at.desc()).first()
        stats.append({
            "label_id": label.id,
            "label_name": label.name,
            "count": count,
            "last_used": last.updated_at if last else None
        })
    return stats

@router.get("/history", response_model=List[Dict[str, Any]])
def get_label_change_history(db: Session = Depends(get_session)):
    """Return label change history (audits) sorted by time."""
    audits = db.query(models.LabelAudit).order_by(models.LabelAudit.timestamp.desc()).limit(200).all()
    return [
        {
            "id": a.id,
            "proposal_id": a.proposal_id,
            "action": a.action,
            "performed_by": a.performed_by,
            "note": a.note,
            "timestamp": a.timestamp
        }
        for a in audits
    ]

@router.get("/trends", response_model=List[Dict[str, Any]])
def get_labeling_trends(db: Session = Depends(get_session)):
    """Return time-series data of label proposals per day (last 90 days)."""
    days_ago = datetime.utcnow() - timedelta(days=90)
    results = db.query(
        func.date(models.LabelProposal.created_at).label("date"),
        func.count(models.LabelProposal.id)
    ).filter(
        models.LabelProposal.created_at >= days_ago
    ).group_by(func.date(models.LabelProposal.created_at)).order_by(func.date(models.LabelProposal.created_at)).all()
    return [{"date": str(r[0]), "count": r[1]} for r in results]

@router.get("/anomalies", response_model=List[Dict[str, Any]])
def get_labeling_anomalies(db: Session = Depends(get_session)):
    """Detect days with anomalous spikes in label proposals (z-score > 2)."""
    days_ago = datetime.utcnow() - timedelta(days=90)
    results = db.query(
        func.date(models.LabelProposal.created_at).label("date"),
        func.count(models.LabelProposal.id)
    ).filter(
        models.LabelProposal.created_at >= days_ago
    ).group_by(func.date(models.LabelProposal.created_at)).order_by(func.date(models.LabelProposal.created_at)).all()
    import numpy as np
    counts = np.array([r[1] for r in results])
    if len(counts) < 2:
        return []
    mean, std = np.mean(counts), np.std(counts)
    anomalies = []
    for (date, count) in results:
        z = (count - mean) / std if std else 0
        if z > 2:
            anomalies.append({"date": str(date), "count": count, "z_score": float(z)})
    return anomalies

@router.get("/ml-performance", response_model=Dict[str, Any])
def get_ml_model_performance():
    """Return ML model performance metrics (placeholder, to be updated with real metrics)."""
    # In production, track accuracy, precision, recall, feedback, etc.
    return {
        "accuracy": None,
        "precision": None,
        "recall": None,
        "last_trained": None,
        "feedback_count": 0
    }

@router.get("/user-analytics", response_model=List[Dict[str, Any]])
def get_user_analytics(db: Session = Depends(get_session)):
    """Return analytics per user (proposals, reviews, approvals)."""
    users = db.query(models.LabelProposal.proposed_by).distinct().all()
    stats = []
    for (user,) in users:
        proposals = db.query(models.LabelProposal).filter(models.LabelProposal.proposed_by == user).count()
        reviews = db.query(models.LabelReview).filter(models.LabelReview.reviewer == user).count()
        approvals = db.query(models.LabelProposal).filter(models.LabelProposal.proposed_by == user, models.LabelProposal.status == models.LabelStatus.APPROVED).count()
        stats.append({
            "user": user,
            "proposals": proposals,
            "reviews": reviews,
            "approvals": approvals
        })
    return stats

@router.get("/export", response_model=Dict[str, Any])
def export_dashboard_data(db: Session = Depends(get_session)):
    """Export dashboard data as a downloadable report (JSON)."""
    data = {
        "coverage": get_labeling_coverage(db),
        "trends": get_labeling_trends(db),
        "anomalies": get_labeling_anomalies(db),
        "user_analytics": get_user_analytics(db)
    }
    return data
