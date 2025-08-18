from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, crud, schemas
from collections import Counter
import difflib

# --- Label Suggestion Engine ---
def suggest_labels_for_object(
    db: Session,
    object_type: str,
    object_id: str,
    schema_metadata: Optional[dict] = None,
    classifier_results: Optional[List[str]] = None
) -> List[models.SensitivityLabel]:
    """
    Advanced suggestion engine:
    - Uses classifier results, schema metadata, fuzzy/semantic matching, and historical patterns.
    - Always returns at least a default set of labels (never empty).
    - Prioritizes compliance, privacy, and security labels for ambiguous columns.
    - Adds a 'Custom/Other' suggestion if nothing matches.
    """
    all_labels = crud.get_labels(db)
    suggestions = set()
    # 1. Use classifier results (exact and partial match)
    if classifier_results:
        for label in all_labels:
            for cat in classifier_results:
                if cat.lower() in label.name.lower() or label.name.lower() in cat.lower():
                    suggestions.add(label)
                # Fuzzy match
                if difflib.SequenceMatcher(None, cat.lower(), label.name.lower()).ratio() > 0.7:
                    suggestions.add(label)
    # 2. Use schema metadata (column/table names, types, fuzzy)
    if schema_metadata:
        name = schema_metadata.get("name", "").lower()
        for label in all_labels:
            if label.name.lower() in name or name in label.name.lower():
                suggestions.add(label)
            # Fuzzy match
            if difflib.SequenceMatcher(None, name, label.name.lower()).ratio() > 0.7:
                suggestions.add(label)
    # 3. Use historical label patterns (most common for similar objects)
    proposals = crud.get_proposals(db, object_type=object_type, object_id=None, status=models.LabelStatus.APPROVED)
    label_counts = Counter()
    for p in proposals:
        if p.object_id != object_id:
            label_counts[p.label_id] += 1
    for label_id, _ in label_counts.most_common(3):
        label = crud.get_label(db, label_id)
        if label:
            suggestions.add(label)
    # 4. Compliance/Privacy/Security fallback
    compliance_keywords = ["pii", "privacy", "confidential", "sensitive", "security", "financial", "gdpr", "hipaa"]
    for label in all_labels:
        if any(kw in label.name.lower() for kw in compliance_keywords):
            suggestions.add(label)
    # 5. Fallback: always include a 'Custom/Other' or 'Not Classified' label
    fallback_labels = [l for l in all_labels if "custom" in l.name.lower() or "other" in l.name.lower() or "not classified" in l.name.lower()]
    if fallback_labels:
        suggestions.update(fallback_labels)
    # 6. If still empty, return all labels (last resort)
    if not suggestions:
        return all_labels
    return list(suggestions)

def rules_based_suggestion(features):
    """
    Rules-based fallback for label suggestion.
    Example logic: if feature vector contains a high value in the 'string' position, suggest 'PII'; if 'int', suggest 'Financial'; else 'Other'.
    """
    # Example: features[0] = is_string, features[1] = is_int
    if len(features) > 0 and features[0] == 1:
        return {"suggestion": "PII", "confidence": 1.0, "explanation": "String type detected, likely PII."}
    elif len(features) > 1 and features[1] == 1:
        return {"suggestion": "Financial", "confidence": 1.0, "explanation": "Integer type detected, likely financial data."}
    else:
        return {"suggestion": "Other", "confidence": 0.5, "explanation": "Default fallback."}

# --- User Interaction: Accept/Modify/Reject Suggestions ---
def accept_label_suggestion(
    db: Session,
    label_id: int,
    object_type: str,
    object_id: str,
    user_email: str,
    justification: Optional[str] = None,
    expiry_date: Optional[str] = None,
    review_cycle_days: Optional[int] = None
) -> models.LabelProposal:
    # Create a proposal for the suggested label
    proposal = schemas.LabelProposalCreate(
        label_id=label_id,
        object_type=object_type,
        object_id=object_id,
        proposed_by=user_email,
        justification=justification,
        expiry_date=expiry_date,
        review_cycle_days=review_cycle_days
    )
    return crud.create_proposal(db, proposal)

def modify_label_suggestion(
    db: Session,
    proposal_id: int,
    new_label_id: int,
    user_email: str,
    justification: Optional[str] = None
) -> models.LabelProposal:
    # Update the proposal with a new label and justification
    proposal = crud.get_proposals(db, status=None)
    proposal = next((p for p in proposal if p.id == proposal_id), None)
    if not proposal:
        raise ValueError("Proposal not found")
    proposal.label_id = new_label_id
    proposal.justification = justification
    proposal.updated_at = schemas.datetime.utcnow()
    # Log audit
    crud.create_audit(db, schemas.LabelAuditCreate(
        proposal_id=proposal_id,
        action="modified",
        performed_by=user_email,
        note=justification
    ))
    db.commit()
    db.refresh(proposal)
    return proposal

def reject_label_suggestion(
    db: Session,
    proposal_id: int,
    user_email: str,
    justification: Optional[str] = None
) -> models.LabelProposal:
    # Mark the proposal as rejected
    proposal = crud.update_proposal_status(db, proposal_id, models.LabelStatus.REJECTED)
    # Log audit
    crud.create_audit(db, schemas.LabelAuditCreate(
        proposal_id=proposal_id,
        action="rejected_by_user",
        performed_by=user_email,
        note=justification
    ))
    return proposal

# Export all main functions for import
__all__ = [
    "suggest_labels_for_object",
    "accept_label_suggestion",
    "modify_label_suggestion",
    "reject_label_suggestion",
    "rules_based_suggestion"
]
