from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.db_session import get_session
from . import models, schemas

router = APIRouter(prefix="/ml-feedback", tags=["ML Feedback"])

# Map Feedback model to MLFeedback schema
@router.get("/", response_model=List[schemas.MLFeedback])
def list_ml_feedback(db: Session = Depends(get_session)):
    feedbacks = db.query(models.Feedback).all()
    return [
        schemas.MLFeedback(
            id=f.id,
            label_id=f.label_id,
            user_id=f.user_id,
            feedback_text=f.feedback_text if hasattr(f, 'feedback_text') else f"actual_label: {f.actual_label}, features: {f.features}",
        ) for f in feedbacks
    ]

@router.post("/", response_model=schemas.MLFeedback)
def create_ml_feedback(feedback: schemas.MLFeedbackCreate, db: Session = Depends(get_session)):
    db_feedback = models.Feedback(
        user_id=feedback.user_id,
        user_email=None,
        label_id=feedback.label_id,
        features={},
        actual_label=feedback.feedback_text,
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return schemas.MLFeedback(
        id=db_feedback.id,
        label_id=db_feedback.label_id,
        user_id=db_feedback.user_id,
        feedback_text=db_feedback.actual_label,
    )

@router.get("/analytics")
def ml_feedback_analytics(db: Session = Depends(get_session)):
    count = db.query(models.Feedback).count()
    avg_length = db.query(models.Feedback).with_entities(func.avg(func.length(models.Feedback.actual_label))).scalar() or 0
    user_count = db.query(models.Feedback.user_email).distinct().count()
    # Advanced analytics: label distribution, accuracy, per-label stats
    label_counts = {}
    correct = 0
    total = 0
    feedbacks = db.query(models.Feedback).all()
    for f in feedbacks:
        actual = getattr(f, 'actual_label', None)
        predicted = None
        if hasattr(f, 'features') and isinstance(f.features, dict):
            predicted = f.features.get('predicted_label')
        if actual:
            label_counts[actual] = label_counts.get(actual, 0) + 1
        if actual and predicted:
            total += 1
            if actual == predicted:
                correct += 1
    accuracy = (correct / total) if total else None
    return {
        "count": count,
        "avgLength": avg_length,
        "userCount": user_count,
        "labelDistribution": label_counts,
        "accuracy": accuracy,
        "totalCompared": total
    }

@router.get("/confusion-matrix")
def ml_confusion_matrix(db: Session = Depends(get_session)):
    """
    Compute a real confusion matrix for ML feedback (actual vs. predicted labels).
    Assumes Feedback.actual_label is the true label and Feedback.features contains a 'predicted_label' key.
    """
    feedbacks = db.query(models.Feedback).all()
    y_true = []
    y_pred = []
    for f in feedbacks:
        actual = getattr(f, 'actual_label', None)
        predicted = None
        if hasattr(f, 'features') and isinstance(f.features, dict):
            predicted = f.features.get('predicted_label')
        if actual is not None and predicted is not None:
            y_true.append(actual)
            y_pred.append(predicted)
    if not y_true or not y_pred:
        return {"matrix": [], "labels": []}
    # Get unique labels
    labels = sorted(list(set(y_true) | set(y_pred)))
    label_to_idx = {label: idx for idx, label in enumerate(labels)}
    # Build confusion matrix
    matrix = [[0 for _ in labels] for _ in labels]
    for t, p in zip(y_true, y_pred):
        i = label_to_idx[t]
        j = label_to_idx[p]
        matrix[i][j] += 1
    return {"matrix": matrix, "labels": labels}
