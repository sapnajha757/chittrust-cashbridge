from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

from app.schemas.cash import (
    CashContributionRequest,
    CashContributionResponse,
    AgentGroupSummary,
    AgentCashMemberSummary,
    ProofURLResponse,
)
from app.services.agent_service import agent_service
from app.services.contribution_service import DEMO_CONTRIBUTIONS

router = APIRouter()

DEMO_AGENT_GROUPS = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Ganesh Traders Community Chit #1",
        "total_amount": 30000.0,
        "contribution_per_month": 2500.0,
        "cash_member_count": 1,
        "status": "active",
    }
]

DEMO_AGENT_CASH_MEMBERS = [
    {
        "membership_id": "33333333-3333-3333-3333-333333333333",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "user_id": "00000000-0000-0000-0000-000000000004",
        "member_name": "Anil Verma (Cash Member)",
        "phone_number": "+919900000004",
        "monthly_contribution": 2500.0,
        "current_month_due": 2,
        "is_current_month_paid": False,
        "agent_id": "00000000-0000-0000-0000-000000000002",
    }
]


@router.get("/my-groups", response_model=List[AgentGroupSummary])
async def list_agent_groups():
    """
    Returns list of active groups assigned to the authenticated CashBridge agent.
    """
    return DEMO_AGENT_GROUPS


@router.get("/groups/{group_id}/cash-members", response_model=List[AgentCashMemberSummary])
async def list_agent_cash_members(group_id: str):
    """
    Returns list of active cash members assigned to the authenticated CashBridge agent.
    """
    return [m for m in DEMO_AGENT_CASH_MEMBERS if m["group_id"] == group_id]


@router.post("/contributions/cash", response_model=CashContributionResponse, status_code=status.HTTP_201_CREATED)
async def record_cash_contribution(req: CashContributionRequest):
    """
    Records a doorstep cash contribution with mandatory photo proof.
    Verifies agent authorization, expected amount, and prevents duplicates.
    """
    agent_id = "00000000-0000-0000-0000-000000000002"  # Derived from auth session in production
    month_number = req.month_number or 2

    return agent_service.record_cash_contribution(
        agent_id=agent_id,
        membership_id=req.membership_id,
        amount=req.amount,
        month_number=month_number,
        photo_proof_url=req.photo_proof_url,
    )


@router.get("/contributions/{contribution_id}/proof-url", response_model=ProofURLResponse)
async def get_contribution_proof_url(contribution_id: str):
    """
    Generates a secure 15-minute expiring signed URL for accessing private photo proof.
    """
    user_id = "00000000-0000-0000-0000-000000000004"
    user_role = "member"
    return agent_service.get_signed_proof_url(contribution_id, user_id, user_role)


@router.get("/cash-entries")
async def list_agent_cash_entries():
    """
    Returns chronological history of doorstep cash collections recorded by current agent.
    """
    agent_id = "00000000-0000-0000-0000-000000000002"
    return [c for c in DEMO_CONTRIBUTIONS if c.get("recorded_by_agent_id") == agent_id or c.get("mode") == "cash"]
