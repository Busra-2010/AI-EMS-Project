from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.dependencies import get_current_user
from app.ai.chatbot import get_chatbot_response, initialize_chatbot

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])

# Initialize chatbot when router loads
initialize_chatbot()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/ask", response_model=ChatResponse)
def ask_chatbot(
    request: ChatRequest,
    current_user=Depends(get_current_user)
):
    """Ask the HR policy chatbot a question"""
    if not request.message.strip():
        return ChatResponse(response="Please ask a question.")

    response = get_chatbot_response(request.message)
    return ChatResponse(response=response)

@router.get("/health")
def chatbot_health():
    """Check if chatbot is initialized"""
    from app.ai.chatbot import is_initialized
    return {
        "status": "ready" if is_initialized else "not ready",
        "message": "Chatbot is ready!" if is_initialized else "Chatbot is initializing..."
    }

