from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Boolean, JSON, Float
from sqlalchemy.orm import relationship, declarative_base
import enum
import datetime

Base = declarative_base()

class LabelStatus(enum.Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class SensitivityLabel(Base):
    __tablename__ = "sensitivity_labels"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    color = Column(String, default="#cccccc")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_conditional = Column(Boolean, default=False)
    condition_expression = Column(Text, nullable=True)  # e.g., "if joined with Table X"
    applies_to = Column(String, default="column")  # table, column, relationship, flow
    proposals = relationship("LabelProposal", back_populates="label")

class LabelProposal(Base):
    __tablename__ = "label_proposals"
    id = Column(Integer, primary_key=True, index=True)
    label_id = Column(Integer, ForeignKey("sensitivity_labels.id"))
    object_type = Column(String, nullable=False)  # e.g., 'table', 'column', 'relationship'
    object_id = Column(String, nullable=False)    # e.g., table/column name or unique id
    proposed_by = Column(String, nullable=False)
    justification = Column(Text)
    status = Column(Enum(LabelStatus, values_callable=lambda x: [e.value for e in x]), default=LabelStatus.PROPOSED.value)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    review_cycle_days = Column(Integer, nullable=True)  # e.g., 180 for 6 months
    label = relationship("SensitivityLabel", back_populates="proposals")
    audits = relationship("LabelAudit", back_populates="proposal")
    reviews = relationship("LabelReview", back_populates="proposal")

class LabelAudit(Base):
    __tablename__ = "label_audits"
    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("label_proposals.id"))
    action = Column(String, nullable=False)  # e.g., 'proposed', 'approved', 'rejected', 'reviewed'
    performed_by = Column(String, nullable=False)
    note = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    proposal = relationship("LabelProposal", back_populates="audits")

class LabelReview(Base):
    __tablename__ = "label_reviews"
    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("label_proposals.id"))
    reviewer = Column(String, nullable=False)
    review_status = Column(Enum(LabelStatus, values_callable=lambda x: [e.value for e in x]), default=LabelStatus.PROPOSED.value)
    review_note = Column(Text)
    review_date = Column(DateTime, default=datetime.datetime.utcnow)
    completed_date = Column(DateTime, nullable=True)  # <-- NEW FIELD
    proposal = relationship("LabelProposal", back_populates="reviews")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., 'expiry', 'review', 'pending', 'system'
    message = Column(Text, nullable=False)
    related_object_type = Column(String, nullable=True)  # e.g., 'column', 'table', etc.
    related_object_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)

class Feedback(Base):
    __tablename__ = "ml_feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)  # New: direct user id
    user_email = Column(String, nullable=True)
    label_id = Column(Integer, nullable=True)  # New: direct label id
    features = Column(JSON, nullable=False)
    actual_label = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MLModelVersion(Base):
    __tablename__ = "ml_model_versions"
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, nullable=False)
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    is_active = Column(Boolean, default=False)  # New: track if this version is active

class MLSuggestion(Base):
    __tablename__ = "ml_suggestions"
    id = Column(Integer, primary_key=True, index=True)
    label_id = Column(Integer, ForeignKey("sensitivity_labels.id"))
    suggested_label = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    reviewer = Column(String, nullable=True)
    reviewer_avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    label = relationship("SensitivityLabel")

class LineageEdge(Base):
    __tablename__ = "lineage_edges"
    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, nullable=False)  # e.g., 'table', 'column', 'label'
    source_id = Column(String, nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(String, nullable=False)
    relationship_type = Column(String, default="data_flow")  # e.g., 'data_flow', 'reference', etc.

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False, unique=True)
    preferences = Column(JSON, nullable=False)
