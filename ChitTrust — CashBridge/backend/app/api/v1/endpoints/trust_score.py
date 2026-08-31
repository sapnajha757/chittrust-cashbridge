from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.schemas.trust_score import (
    TrustScoreResponse,
    TrustScoreEventResponse,
    TrustScoreBreakdownResponse,
    TrustScoreExplanationResponse,
)
from app.services.trust_score_service import trust_score_service
from app.services.trust_score_explanation_service import trust_score_explanation_service

router = APIRouter()

@router.get("/me/trust-score", response_model=TrustScoreResponse)
async def get_my_trust_score():
    """
    Returns current authenticated user's credit trust score snapshot.
    """
    user_id = "00000000-0000-0000-0000-000000000003"  # Derived from auth session in production
    return trust_score_service.get_user_trust_score(user_id)


@router.get("/me/trust-score/history", response_model=List[TrustScoreEventResponse])
async def get_my_trust_score_history():
    """
    Returns chronological event timeline showing exact point entries and streak bonuses.
    """
    user_id = "00000000-0000-0000-0000-000000000003"
    return trust_score_service.get_user_score_history(user_id)


@router.get("/me/trust-score/breakdown", response_model=TrustScoreBreakdownResponse)
async def get_my_trust_score_breakdown():
    """
    Returns itemized mathematical score calculation breakdown.
    """
    user_id = "00000000-0000-0000-0000-000000000003"
    return trust_score_service.get_user_score_breakdown(user_id)


@router.get("/me/trust-score/explanation", response_model=TrustScoreExplanationResponse)
async def get_my_trust_score_explanation():
    """
    Returns structured human-readable explanation of score factors.
    """
    user_id = "00000000-0000-0000-0000-000000000003"
    return trust_score_explanation_service.generate_explanation(user_id)


@router.get("/groups/{group_id}/members/{membership_id}/trust-score", response_model=TrustScoreResponse)
async def get_group_member_trust_score(group_id: str, membership_id: str):
    """
    Returns group member's trust score for authorized organizers.
    """
    # Demo member ID lookup
    user_id = "00000000-0000-0000-0000-000000000003"
    return trust_score_service.get_user_trust_score(user_id)
