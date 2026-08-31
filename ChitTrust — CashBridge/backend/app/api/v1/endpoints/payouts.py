from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.schemas.payout import (
    AssignAgentPayoutRequest,
    ConfirmCashPayoutRequest,
    PayoutResponse,
)
from app.services.payout_service import payout_service

router = APIRouter()

@router.get("/payouts/{payout_id}", response_model=PayoutResponse)
async def get_payout_details(payout_id: str):
    """
    Returns payout details, status, mode, and assigned agent information.
    """
    return payout_service.get_payout(payout_id)


@router.post("/payouts/{payout_id}/assign-agent", response_model=PayoutResponse)
async def assign_agent_to_payout(payout_id: str, req: AssignAgentPayoutRequest):
    """
    Assigns CashBridge Agent to deliver doorstep cash payout to cash winner.
    """
    organizer_id = "00000000-0000-0000-0000-000000000001"
    return payout_service.assign_agent(payout_id, req.agent_id, organizer_id)


@router.post("/payouts/{payout_id}/cash-confirm", response_model=PayoutResponse)
async def confirm_cash_payout(payout_id: str, req: ConfirmCashPayoutRequest):
    """
    Verified CashBridge Agent confirms doorstep cash payout handover with photo proof.
    """
    agent_id = "00000000-0000-0000-0000-000000000002"
    return payout_service.confirm_cash_payout(payout_id, agent_id, req.cash_proof_url)


@router.post("/payouts/{payout_id}/upi", response_model=PayoutResponse)
async def process_upi_payout(payout_id: str):
    """
    Processes digital UPI payout for online winners.
    """
    return payout_service.process_upi_payout(payout_id)
