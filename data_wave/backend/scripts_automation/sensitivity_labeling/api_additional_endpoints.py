from fastapi import APIRouter, Depends, HTTPException, status, Body, Cookie
from sqlalchemy.orm import Session
from typing import Optional
from . import crud, models, schemas
from app.db_session import get_session
from app.models.auth_models import User
from app.services.auth_service import get_session_by_token, has_role

router = APIRouter(
    prefix="/sensitivity-labels",
    tags=["Sensitivity Labels Additional"]
)

def get_current_user(session_token: str = Cookie(None), db: Session = Depends(get_session)) -> User:
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = get_session_by_token(db, session_token)
    if not session or not session.user:
        raise HTTPException(status_code=401, detail="Invalid session")
    return session.user

@router.put("/{label_id}", response_model=schemas.SensitivityLabel)
def update_label(label_id: int, label: schemas.SensitivityLabelCreate, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    existing_label = crud.get_label(db, label_id)
    if not existing_label:
        raise HTTPException(status_code=404, detail="Label not found")
    # Optionally check permissions here
    for key, value in label.dict(exclude_unset=True).items():
        setattr(existing_label, key, value)
    db.commit()
    db.refresh(existing_label)
    return existing_label

@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label(label_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    label = crud.get_label(db, label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    # Optionally check permissions here
    crud.delete_label(db, label_id)
    return None
