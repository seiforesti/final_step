# # backend/app/api/routes/auth.py
# from fastapi import APIRouter, HTTPException, status, Form
# from fastapi.responses import RedirectResponse
# from pydantic import BaseModel
# import uuid

# router = APIRouter(prefix="/auth", tags=["Authentication"])

# class LoginRequest(BaseModel):
#     email: str

# @router.post("/login")
# def login_user(email: str = Form(...)):
#     if not email or "@" not in email:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format")
#     token = str(uuid.uuid4())
#     return {"token": token, "token_type": "bearer"}

# @router.get("/google/login")
# def login_google():
#     return RedirectResponse(url="https://accounts.google.com/o/oauth2/auth?mock=true")

# @router.get("/azure/login")
# def login_azure():
#     return RedirectResponse(url="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?mock=true")
