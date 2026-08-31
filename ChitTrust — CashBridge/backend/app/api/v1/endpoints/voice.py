from fastapi import APIRouter, Depends, HTTPException, status
from app.services.trust_score_explanation_service import trust_score_explanation_service

router = APIRouter()

@router.get("/trust-score", tags=["Voice AI Integration Boundary"])
async def get_voice_trust_score_explanation():
    """
    Voice-ready API boundary endpoint for future Multilingual Voice AI assistant integration.
    Returns structured natural language trust score explanation.
    """
    user_id = "00000000-0000-0000-0000-000000000003"
    explanation = trust_score_explanation_service.generate_explanation(user_id)

    return {
        "user_id": user_id,
        "score": explanation["score"],
        "spoken_text": explanation["explanation_summary"],
        "factors": explanation["key_factors"],
    }
