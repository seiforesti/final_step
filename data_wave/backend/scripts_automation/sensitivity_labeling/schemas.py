from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum

class LabelStatus(str, Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class SensitivityLabelBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#cccccc"
    is_conditional: Optional[bool] = False
    condition_expression: Optional[str] = None
    applies_to: Optional[str] = "column"  # table, column, relationship, flow

class SensitivityLabelCreate(SensitivityLabelBase):
    pass

class SensitivityLabel(SensitivityLabelBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class LabelProposalBase(BaseModel):
    label_id: int
    object_type: str
    object_id: str
    proposed_by: str
    justification: Optional[str] = None
    expiry_date: Optional[datetime] = None
    review_cycle_days: Optional[int] = None

class LabelProposalCreate(LabelProposalBase):
    pass

class LabelProposal(LabelProposalBase):
    id: int
    status: LabelStatus
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class LabelAuditBase(BaseModel):
    proposal_id: int
    action: str
    performed_by: str
    note: Optional[str] = None

class LabelAuditCreate(LabelAuditBase):
    pass

class LabelAudit(LabelAuditBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class LabelReviewBase(BaseModel):
    proposal_id: int
    reviewer: str
    review_status: LabelStatus
    review_note: Optional[str] = None

class LabelReviewCreate(LabelReviewBase):
    pass

class LabelReview(LabelReviewBase):
    id: int
    review_date: datetime
    completed_date: Optional[datetime] = None  # <-- add this
    class Config:
        from_attributes = True

class MLSuggestion(BaseModel):
    id: int
    label_id: int
    suggested_label: str
    confidence: float
    reviewer: str = None
    reviewer_avatar_url: str = None
    created_at: datetime
    class Config:
        from_attributes = True

class SensitivityLabelAnalytics(BaseModel):
    total_labels: int
    conditional_labels: int
    non_conditional_labels: int
    unique_scopes: int
    scopes: List[str]
    created_from: Optional[str] = None  # ISO date
    created_to: Optional[str] = None  # ISO date

class ProposalAnalytics(BaseModel):
    total_proposals: int
    approved: int
    rejected: int
    expired: int
    pending: int
    unique_objects: int
    created_from: Optional[str] = None
    created_to: Optional[str] = None

class NotificationAnalytics(BaseModel):
    total_notifications: int
    unread: int
    read: int
    types: List[str]
    created_from: Optional[str] = None
    created_to: Optional[str] = None

class MLFeedbackAnalytics(BaseModel):
    total_feedback: int
    unique_users: int
    unique_labels: int
    correct_predictions: int
    incorrect_predictions: int
    accuracy: float
    created_from: Optional[str] = None
    created_to: Optional[str] = None

class MLConfusionMatrix(BaseModel):
    labels: list[str]
    matrix: list[list[int]]

class MLFeedbackBase(BaseModel):
    label_id: int
    user_id: int
    feedback_text: str

class MLFeedbackCreate(MLFeedbackBase):
    pass

class MLFeedback(MLFeedbackBase):
    id: int
    class Config:
        orm_mode = True
