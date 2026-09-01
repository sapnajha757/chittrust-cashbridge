from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
from app.schemas.ai import (
    AIRiskAssessmentResponse,
    ReviewAIRiskAssessmentRequest,
    AIChatRequest,
    AIChatResponse,
    AITrustScoreExplanationResponse,
    GroupHealthSummary,
)
from app.services.ai.risk_engine import ai_risk_engine
from app.services.ai.assistant import ai_assistant_service

from app.auth.deps import get_current_user, require_member, require_organizer, require_admin

router = APIRouter()

@router.get("/insights/group/{group_id}", response_model=GroupHealthSummary)
async def get_group_health_summary(
    group_id: str,
    current_user: Dict[str, Any] = Depends(require_member)
):
    """
    Returns non-financial operational Group Health score and AI insights.
    """
    return {
        "group_id": group_id,
        "group_name": "Ganesh Traders Community Chit #1",
        "health_status": "Healthy",
        "on_time_rate": 94.0,
        "unresolved_flags_count": 1,
        "summary_text": "94% of contributions are on time. No unresolved critical flags.",
    }


@router.get("/risk-assessments", response_model=List[AIRiskAssessmentResponse])
async def list_ai_risk_assessments(
    status: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """
    Lists AI Risk Assessments for authorized admins.
    """
    return ai_risk_engine.list_assessments(status_filter=status)


@router.get("/risk-assessments/{assessment_id}", response_model=AIRiskAssessmentResponse)
async def get_ai_risk_assessment_details(
    assessment_id: str,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """
    Returns detailed evidence timeline & AI explanation for a specific risk flag.
    """
    return ai_risk_engine.get_assessment(assessment_id)


@router.post("/risk-assessments/{assessment_id}/review", response_model=AIRiskAssessmentResponse)
async def review_ai_risk_assessment(
    assessment_id: str,
    req: ReviewAIRiskAssessmentRequest,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """
    Submits human-in-the-loop review resolution note for an AI Risk Assessment.
    """
    reviewed_by = current_user["id"]
    return ai_risk_engine.review_assessment(
        assessment_id=assessment_id,
        status=req.status,
        resolution_note=req.resolution_note,
        reviewed_by=reviewed_by,
    )


@router.get("/users/me/trust-score/explanation", response_model=AITrustScoreExplanationResponse)
async def get_trust_score_ai_explanation(
    language: str = "hi",
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generates natural language explanation ("Mera score kyun badha?") based strictly on DB events.
    """
    user_id = current_user["id"]
    return ai_assistant_service.explain_trust_score(user_id, language=language)


@router.post("/chat", response_model=AIChatResponse)
async def ai_chat_assistant(
    req: AIChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Interactive conversational assistant answering questions in Hindi/English using DB context.
    """
    user_id = current_user["id"]
    return ai_assistant_service.chat_assistant(user_id, req.message, req.language)
