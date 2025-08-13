import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sensitivity_labeling import crud, models, schemas
from datetime import datetime
from sqlalchemy.exc import IntegrityError
import sqlalchemy
import sys

# Use a test database (in-memory SQLite for isolation)
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
models.Base.metadata.create_all(bind=engine)

@pytest.fixture
def db():
    session = TestingSessionLocal()
    yield session
    session.close()

def test_create_and_get_label(db):
    label_in = schemas.SensitivityLabelCreate(name="Test Label", description="desc", color="#fff")
    label = crud.create_label(db, label_in)
    assert label.id is not None
    fetched = crud.get_label(db, label.id)
    assert fetched.name == "Test Label"

def test_create_and_get_proposal(db):
    label_in = schemas.SensitivityLabelCreate(name="Label2", description="desc2")
    label = crud.create_label(db, label_in)
    proposal_in = schemas.LabelProposalCreate(
        label_id=label.id,
        object_type="table",
        object_id="tbl1",
        proposed_by="user@example.com"
    )
    proposal = crud.create_proposal(db, proposal_in)
    assert proposal.id is not None
    proposals = crud.get_proposals(db, object_type="table")
    assert any(p.id == proposal.id for p in proposals)

def test_update_proposal_status(db):
    label_in = schemas.SensitivityLabelCreate(name="Label3", description="desc3")
    label = crud.create_label(db, label_in)
    proposal_in = schemas.LabelProposalCreate(
        label_id=label.id,
        object_type="column",
        object_id="col1",
        proposed_by="user2@example.com"
    )
    proposal = crud.create_proposal(db, proposal_in)
    updated = crud.update_proposal_status(db, proposal.id, schemas.LabelStatus.APPROVED)
    assert updated.status.value == schemas.LabelStatus.APPROVED.value

def test_create_and_get_review(db):
    label_in = schemas.SensitivityLabelCreate(name="Label4", description="desc4")
    label = crud.create_label(db, label_in)
    proposal_in = schemas.LabelProposalCreate(
        label_id=label.id,
        object_type="table",
        object_id="tbl2",
        proposed_by="user3@example.com"
    )
    proposal = crud.create_proposal(db, proposal_in)
    review_in = schemas.LabelReviewCreate(
        proposal_id=proposal.id,
        reviewer="reviewer@example.com",
        review_status=schemas.LabelStatus.PROPOSED
    )
    review = crud.create_review(db, review_in)
    reviews = crud.get_reviews(db, proposal.id)
    assert any(r.id == review.id for r in reviews)

def test_create_label_missing_fields(db):
    # Missing required 'name' field
    with pytest.raises(Exception):
        label_in = schemas.SensitivityLabelCreate(description="desc", color="#fff")
        crud.create_label(db, label_in)

def test_create_proposal_invalid_label_id(db):
    # Non-existent label_id
    proposal_in = schemas.LabelProposalCreate(
        label_id=9999,
        object_type="table",
        object_id="tbl1",
        proposed_by="user@example.com"
    )
    if 'sqlite' in str(db.bind.url):
        pytest.skip("SQLite in-memory does not enforce foreign keys.")
    with pytest.raises(IntegrityError):
        crud.create_proposal(db, proposal_in)
