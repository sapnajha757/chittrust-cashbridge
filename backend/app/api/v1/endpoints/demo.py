from fastapi import APIRouter, HTTPException, status
from app.core.config import settings
from app.services.contribution_service import DEMO_CONTRIBUTIONS
from app.services.auction_service import DEMO_AUCTIONS_DB, DEMO_BIDS_DB, DEMO_PAYOUTS_DB
from app.services.risk_engine import DEMO_RISK_FLAGS_DB
from app.services.ai.risk_engine import DEMO_AI_ASSESSMENTS_DB
from datetime import datetime

router = APIRouter()

@router.post("/reset")
async def reset_demo_dataset():
    """
    Restores preconfigured demo dataset for hackathon presentation.
    Guarded by ENVIRONMENT=development and DEMO_MODE=true. Never available in production.
    """
    effective_env = (settings.APP_ENV or settings.ENVIRONMENT).lower()
    if effective_env == "production" or not settings.DEMO_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo reset is only available when ENVIRONMENT is 'development' and DEMO_MODE is enabled.",
        )

    # 1. Reset Contributions
    DEMO_CONTRIBUTIONS.clear()
    DEMO_CONTRIBUTIONS.extend([
        {
            "id": "c1111111-1111-1111-1111-111111111111",
            "membership_id": "22222222-2222-2222-2222-222222222222",
            "member_name": "Sita Sharma (Digital Member)",
            "month_number": 1,
            "amount": 2500.0,
            "mode": "upi",
            "confirmed_via": "system",
            "paid_on_time": True,
            "payment_status": "successful",
            "transaction_reference": "UPI_REF_987654321",
            "created_at": datetime.utcnow().isoformat(),
        },
        {
            "id": "c2222222-2222-2222-2222-222222222222",
            "membership_id": "33333333-3333-3333-3333-333333333333",
            "member_name": "Anil Verma (Cash Member)",
            "month_number": 1,
            "amount": 2500.0,
            "mode": "cash",
            "confirmed_via": "agent",
            "paid_on_time": True,
            "payment_status": "successful",
            "photo_proof_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop",
            "recorded_by_agent_id": "00000000-0000-0000-0000-000000000002",
            "created_at": datetime.utcnow().isoformat(),
        },
    ])

    # 2. Reset Auctions, Bids & Payouts
    DEMO_AUCTIONS_DB.clear()
    DEMO_AUCTIONS_DB.append({
        "id": "a1111111-1111-1111-1111-111111111111",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "group_name": "Ganesh Traders Community Chit #1",
        "month_number": 3,
        "auction_type": "bid",
        "status": "open",
        "total_pot": 10000.0,
        "winning_bid_discount": None,
        "payout_amount": None,
        "winner": None,
        "bids_count": 3,
        "highest_bid_discount": 1500.0,
        "closed_at": None,
        "created_at": datetime.utcnow().isoformat(),
    })

    # 3. Reset AI Risk Assessments
    DEMO_AI_ASSESSMENTS_DB.clear()
    DEMO_AI_ASSESSMENTS_DB.extend([
        {
            "id": "ai111111-1111-1111-1111-111111111111",
            "group_id": "11111111-1111-1111-1111-111111111111",
            "group_name": "Ganesh Traders Community Chit #1",
            "user_id": None,
            "member_name": None,
            "agent_id": "00000000-0000-0000-0000-000000000002",
            "agent_name": "Suresh Patel (CashBridge Agent)",
            "entity_type": "agent",
            "entity_id": "00000000-0000-0000-0000-000000000002",
            "risk_type": "AGENT_ACTIVITY_SPIKE",
            "risk_score": 74,
            "confidence": 0.86,
            "status": "open",
            "evidence_json": {
                "normal_daily_baseline": 22,
                "today_entries": 61,
                "spike_percentage": "+177%",
            },
            "explanation": "Today's doorstep cash-entry volume is 2.8x higher than recent daily baseline (61 entries vs 22 avg).",
            "recommended_action": "Review today's cash entries and verify photo proof attachments.",
            "model_name": "chittrust-hybrid-v1",
            "model_version": "1.0",
            "created_at": datetime.utcnow().isoformat(),
            "reviewed_at": None,
            "reviewed_by": None,
            "resolution_note": None,
        }
    ])

    return {
        "status": "success",
        "message": "Demo dataset restored successfully to clean hackathon baseline state.",
        "timestamp": datetime.utcnow().isoformat(),
    }
