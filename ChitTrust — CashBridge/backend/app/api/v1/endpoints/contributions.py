from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime

from app.schemas.contribution import (
    UPIOrderCreateRequest,
    UPIOrderResponse,
    UPIVerifyRequest,
    ContributionResponse,
    ContributionSummaryResponse,
)
from app.services.contribution_service import contribution_service, DEMO_CONTRIBUTIONS
from app.core.exceptions import APIException

router = APIRouter()


@router.post("/upi/order", response_model=UPIOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_upi_contribution_order(req: UPIOrderCreateRequest):
    """
    Creates a Razorpay Test Mode Order for monthly UPI contribution.
    Server calculates amount from group settings.
    """
    return contribution_service.create_upi_order(req.membership_id, req.month_number)


@router.post("/upi/verify", response_model=ContributionResponse)
async def verify_upi_contribution_payment(req: UPIVerifyRequest):
    """
    Performs server-side HMAC-SHA256 signature verification for Razorpay payment callback.
    """
    return contribution_service.verify_upi_payment(
        membership_id=req.membership_id,
        month_number=req.month_number,
        order_id=req.razorpay_order_id,
        payment_id=req.razorpay_payment_id,
        signature=req.razorpay_signature,
    )


@router.get("/memberships/{membership_id}/contributions", response_model=List[ContributionResponse])
async def get_membership_contribution_history(membership_id: str):
    """
    Retrieves complete contribution payment history for a member.
    """
    return [c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id]


@router.get("/memberships/{membership_id}/current-contribution", response_model=ContributionResponse)
async def get_current_month_contribution(membership_id: str):
    """
    Retrieves current month contribution payment status for a member.
    """
    contrib = next(
        (c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["month_number"] == 2),
        None,
    )
    if not contrib:
        # Return default pending contribution for month 2
        now_str = datetime.utcnow().isoformat()
        return {
            "id": "c2222222-2222-2222-2222-222222222222",
            "membership_id": membership_id,
            "group_id": "11111111-1111-1111-1111-111111111111",
            "month_number": 2,
            "amount": 2500.0,
            "mode": "upi",
            "confirmed_via": "app",
            "payment_status": "pending",
            "paid_on_time": False,
            "payment_date": None,
            "created_at": now_str,
        }
    return contrib


@router.get("/groups/{group_id}/summary", response_model=ContributionSummaryResponse)
async def get_group_contribution_summary(group_id: str):
    """
    Returns monthly collection summary for organizers (expected vs collected vs pending).
    """
    group_contribs = [c for c in DEMO_CONTRIBUTIONS if c.get("group_id") == group_id]
    collected = sum(c["amount"] for c in group_contribs if c["payment_status"] == "successful")
    pending = sum(c["amount"] for c in group_contribs if c["payment_status"] == "pending")

    return {
        "group_id": group_id,
        "total_expected_amount": 30000.0,
        "collected_amount": collected,
        "pending_amount": 30000.0 - collected,
        "successful_count": len([c for c in group_contribs if c["payment_status"] == "successful"]),
        "pending_count": len([c for c in group_contribs if c["payment_status"] == "pending"]),
        "failed_count": len([c for c in group_contribs if c["payment_status"] == "failed"]),
    }
