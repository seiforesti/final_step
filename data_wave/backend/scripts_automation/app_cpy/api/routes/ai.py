from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from app.services.ai_client import OllamaClient
from app.api.security import require_permission
from app.api.security.rbac import PERMISSION_DASHBOARD_VIEW

router = APIRouter(prefix="/ai", tags=["AI"])

# Request model
class AIRequest(BaseModel):
    question: str

# Response model
class AIResponse(BaseModel):
    answer: str

# Initialize the Ollama client
ollama_client = OllamaClient()

@router.post("/ask", response_model=AIResponse)
def ask_ai(request: AIRequest, current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DASHBOARD_VIEW))):
    try:
        answer = ollama_client.ask(request.question)
        if answer.startswith("Error"):
            raise HTTPException(status_code=502, detail=answer)
        return AIResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
