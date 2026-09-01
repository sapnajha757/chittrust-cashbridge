from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.schemas.payout import (
    AssignAgentPayoutRequest,
    ConfirmCashPayoutRequest,
    PayoutResponse,
)
from app.services.payout_service import payout_service

from app.auth.deps import get_current_user, require_organizer, require_agent

router = APIRouter()

@router.get("/payouts/{payout_id}", response_model=PayoutResponse)
async def get_payout_details(
    payout_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns payout details, status, mode, and assigned agent information.
    """
    return payout_service.get_payout(payout_id)


@router.post("/payouts/{payout_id}/assign-agent", response_model=PayoutResponse)
async def assign_agent_to_payout(
    payout_id: str,
    req: AssignAgentPayoutRequest,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Assigns CashBridge Agent to deliver doorstep cash payout to cash winner.
    """
    organizer_id = current_user["id"]
    return payout_service.assign_agent(payout_id, req.agent_id, organizer_id)


@router.post("/payouts/{payout_id}/cash-confirm", response_model=PayoutResponse)
async def confirm_cash_payout(
    payout_id: str,
    req: ConfirmCashPayoutRequest,
    current_user: Dict[str, Any] = Depends(require_agent)
):
    """
    Verified CashBridge Agent confirms doorstep cash payout handover with photo proof.
    """
    agent_id = current_user["id"]
    return payout_service.confirm_cash_payout(payout_id, agent_id, req.cash_proof_url)


@router.post("/payouts/{payout_id}/upi", response_model=PayoutResponse)
async def process_upi_payout(
    payout_id: str,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Processes digital UPI payout for online winners.
    """
    return payout_service.process_upi_payout(payout_id)
