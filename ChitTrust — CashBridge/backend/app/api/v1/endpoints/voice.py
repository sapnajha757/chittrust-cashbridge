from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.auth.deps import get_current_user
from app.services.trust_score_explanation_service import trust_score_explanation_service

router = APIRouter()

@router.get("/trust-score", tags=["Voice AI Integration Boundary"])
async def get_voice_trust_score_explanation(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Voice-ready API boundary endpoint for future Multilingual Voice AI assistant integration.
    Returns structured natural language trust score explanation.
    """
    user_id = current_user["id"]
    explanation = trust_score_explanation_service.generate_explanation(user_id)

    return {
        "user_id": user_id,
        "score": explanation["score"],
        "spoken_text": explanation["explanation_summary"],
        "factors": explanation["key_factors"],
    }
