from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
from app.schemas.risk import RiskFlagResponse, ResolveRiskFlagRequest
from app.services.risk_engine import risk_engine
from app.auth.deps import get_current_user, require_organizer, require_admin

router = APIRouter()

@router.get("/flags", response_model=List[RiskFlagResponse])
async def list_risk_flags(
    status: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Returns list of operational review risk flags for authorized organizers & admins.
    """
    organizer_id = current_user["id"]
    return risk_engine.list_flags(organizer_id, status_filter=status)


@router.get("/flags/{flag_id}", response_model=RiskFlagResponse)
async def get_risk_flag_details(
    flag_id: str,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Returns detailed evidence for a specific operational review flag.
    """
    return risk_engine.get_flag(flag_id)


@router.post("/flags/{flag_id}/resolve", response_model=RiskFlagResponse)
async def resolve_risk_flag(
    flag_id: str,
    req: ResolveRiskFlagRequest,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Resolves or dismisses an operational review flag with mandatory resolution notes.
    """
    resolved_by = current_user["id"]
    return risk_engine.resolve_flag(
        flag_id=flag_id,
        status=req.status,
        resolution_note=req.resolution_note,
        resolved_by=resolved_by,
    )
