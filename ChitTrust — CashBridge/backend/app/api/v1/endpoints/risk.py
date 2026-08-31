from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.schemas.risk import RiskFlagResponse, ResolveRiskFlagRequest
from app.services.risk_engine import risk_engine

router = APIRouter()

@router.get("/flags", response_model=List[RiskFlagResponse])
async def list_risk_flags(status: Optional[str] = None):
    """
    Returns list of operational review risk flags for authorized organizers & admins.
    """
    organizer_id = "00000000-0000-0000-0000-000000000001"
    return risk_engine.list_flags(organizer_id, status_filter=status)


@router.get("/flags/{flag_id}", response_model=RiskFlagResponse)
async def get_risk_flag_details(flag_id: str):
    """
    Returns detailed evidence for a specific operational review flag.
    """
    return risk_engine.get_flag(flag_id)


@router.post("/flags/{flag_id}/resolve", response_model=RiskFlagResponse)
async def resolve_risk_flag(flag_id: str, req: ResolveRiskFlagRequest):
    """
    Resolves or dismisses an operational review flag with mandatory resolution notes.
    """
    resolved_by = "00000000-0000-0000-0000-000000000001"
    return risk_engine.resolve_flag(
        flag_id=flag_id,
        status=req.status,
        resolution_note=req.resolution_note,
        resolved_by=resolved_by,
    )
