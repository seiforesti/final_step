### === backend/app/api/routes/upload.py ===
from fastapi import APIRouter, Body
from app.services.purview_uploader import upload_metadata_batch

router = APIRouter()

@router.post("/")
def upload_to_purview(payload: dict = Body(...)):
    return upload_metadata_batch(payload)