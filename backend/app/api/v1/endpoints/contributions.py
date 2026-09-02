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

from typing import List, Optional, Dict, Any
from app.auth.deps import get_current_user, require_member, require_organizer

router = APIRouter()


@router.post("/upi/order", response_model=UPIOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_upi_contribution_order(
    req: UPIOrderCreateRequest,
    current_user: Dict[str, Any] = Depends(require_member)
):
    """
    Creates a Razorpay Test Mode Order for monthly UPI contribution.
    Server calculates amount from group settings.
    """
    return contribution_service.create_upi_order(req.membership_id, req.month_number)


@router.post("/upi/verify", response_model=ContributionResponse)
async def verify_upi_contribution_payment(
    req: UPIVerifyRequest,
    current_user: Dict[str, Any] = Depends(require_member)
):
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
async def get_membership_contribution_history(
    membership_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves complete contribution payment history for a member.
    """
    from app.db.supabase import get_supabase_client
    client = get_supabase_client()
    if client:
        try:
            res = client.table("contributions").select("*").eq("membership_id", membership_id).execute()
            if res.data is not None:
                return res.data
        except Exception as err:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(err)}")
    return [c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id]


@router.get("/memberships/{membership_id}/current-contribution", response_model=ContributionResponse)
async def get_current_month_contribution(
    membership_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves current month contribution payment status for a member.
    """
    from app.db.supabase import get_supabase_client
    client = get_supabase_client()
    if client:
        try:
            res = client.table("contributions").select("*").eq("membership_id", membership_id).order("month_number", desc=True).limit(1).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as err:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(err)}")

    contrib = next(
        (c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["month_number"] == 2),
        None,
    )
    if not contrib:
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
async def get_group_contribution_summary(
    group_id: str,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Returns monthly collection summary for organizers (expected vs collected vs pending).
    """
    from app.db.supabase import get_supabase_client
    client = get_supabase_client()
    group_contribs = []

    if client:
        try:
            res = client.table("contributions").select("*").eq("group_id", group_id).execute()
            if res.data is not None:
                group_contribs = res.data
        except Exception as err:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database query error: {str(err)}")

    if not group_contribs:
        group_contribs = [c for c in DEMO_CONTRIBUTIONS if c.get("group_id") == group_id]

    collected = sum(float(c.get("amount", 0)) for c in group_contribs if c.get("payment_status") == "successful")
    pending = sum(float(c.get("amount", 0)) for c in group_contribs if c.get("payment_status") == "pending")

    return {
        "group_id": group_id,
        "total_expected_amount": 30000.0,
        "collected_amount": collected,
        "pending_amount": max(0.0, 30000.0 - collected),
        "successful_count": len([c for c in group_contribs if c.get("payment_status") == "successful"]),
        "pending_count": len([c for c in group_contribs if c.get("payment_status") == "pending"]),
        "failed_count": len([c for c in group_contribs if c.get("payment_status") == "failed"]),
    }

