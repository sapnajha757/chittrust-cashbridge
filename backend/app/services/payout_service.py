import logging
from datetime import datetime
from typing import Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.notification_service import notification_service
from app.services.auction_service import DEMO_PAYOUTS_DB

logger = logging.getLogger("chittrust.payouts")

class PayoutService:
    @classmethod
    def get_payout(cls, payout_id: str) -> Dict[str, Any]:
        payout = next((p for p in DEMO_PAYOUTS_DB if p["id"] == payout_id), None)
        if not payout:
            # Fallback default payout for demo
            payout = {
                "id": payout_id,
                "group_id": "11111111-1111-1111-1111-111111111111",
                "group_name": "Ganesh Traders Community Chit #1",
                "membership_id": "33333333-3333-3333-3333-333333333333",
                "member_name": "Anil Verma (Cash Member)",
                "month_number": 3,
                "amount": 8500.0,
                "auction_discount": 1500.0,
                "mode": "cash",
                "status": "pending",
                "payout_date": datetime.utcnow().isoformat(),
                "assigned_agent_id": "00000000-0000-0000-0000-000000000002",
                "assigned_agent_name": "Suresh Patel (CashBridge Agent)",
                "cash_proof_url": None,
                "transaction_reference": None,
                "created_at": datetime.utcnow().isoformat(),
            }
        return payout

    @classmethod
    def assign_agent(cls, payout_id: str, agent_id: str, organizer_id: str) -> Dict[str, Any]:
        payout = cls.get_payout(payout_id)
        payout["assigned_agent_id"] = agent_id
        payout["assigned_agent_name"] = "Suresh Patel (CashBridge Agent)"
        logger.info(f"Assigned agent {agent_id} to cash payout {payout_id}")
        return payout

    @classmethod
    def confirm_cash_payout(cls, payout_id: str, agent_id: str, cash_proof_url: Optional[str] = None) -> Dict[str, Any]:
        payout = cls.get_payout(payout_id)
        if payout["status"] == "paid":
            return payout

        now = datetime.utcnow().isoformat()
        payout["status"] = "paid"
        payout["payout_date"] = now
        payout["cash_proof_url"] = cash_proof_url or "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop"
        payout["transaction_reference"] = f"CASH_PAYOUT_{payout_id[:8].upper()}"

        # Issue in-app receipt notification to recipient member
        notification_service.send_notification(
            user_id="00000000-0000-0000-0000-000000000004",
            title="Doorstep Cash Payout Received ✓",
            message=f"₹{payout['amount']:,.2f} cash handover completed by CashBridge Agent. Status: Paid.",
            notification_type="payout_received",
            related_entity_id=payout_id,
        )

        logger.info(f"Cash payout {payout_id} marked PAID by agent {agent_id}")
        return payout

    @classmethod
    def process_upi_payout(cls, payout_id: str) -> Dict[str, Any]:
        payout = cls.get_payout(payout_id)
        if payout["status"] == "paid":
            return payout

        now = datetime.utcnow().isoformat()
        payout["status"] = "paid"
        payout["mode"] = "upi"
        payout["payout_date"] = now
        payout["transaction_reference"] = f"UPI_PAYOUT_{payout_id[:8].upper()}"

        logger.info(f"UPI payout {payout_id} completed successfully.")
        return payout

payout_service = PayoutService()
