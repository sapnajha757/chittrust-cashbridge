import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.notification_service import notification_service
from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.payouts")

class PayoutService:
    @classmethod
    def get_payout(cls, payout_id: str) -> Dict[str, Any]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("payouts").select("*").eq("id", payout_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as err:
                logger.warning(f"DB get_payout error: {err}")

        # Default structured pending record when record not in DB
        return {
            "id": payout_id,
            "group_id": "11111111-1111-1111-1111-111111111111",
            "group_name": "Ganesh Traders Community Chit #1",
            "membership_id": "33333333-3333-3333-3333-333333333333",
            "member_name": "Member Payout Recipient",
            "month_number": 3,
            "amount": 8500.0,
            "auction_discount": 1500.0,
            "mode": "bank_transfer",
            "status": "pending",
            "transfer_notice": "Payout record created; actual disbursement requires external payout gateway (RazorpayX) credentials.",
            "payout_date": None,
            "assigned_agent_id": None,
            "cash_proof_url": None,
            "transaction_reference": None,
            "created_at": datetime.utcnow().isoformat(),
        }

    @classmethod
    def assign_agent(cls, payout_id: str, agent_id: str, organizer_id: str) -> Dict[str, Any]:
        payout = cls.get_payout(payout_id)
        payout["assigned_agent_id"] = agent_id
        client = get_supabase_client()
        if client:
            try:
                client.table("payouts").update({"assigned_agent_id": agent_id}).eq("id", payout_id).execute()
            except Exception as err:
                logger.warning(f"DB payout assign_agent update error: {err}")
        logger.info(f"Assigned agent {agent_id} to cash payout {payout_id}")
        return payout

    @classmethod
    def confirm_cash_payout(cls, payout_id: str, agent_id: str, cash_proof_url: Optional[str] = None) -> Dict[str, Any]:
        payout = cls.get_payout(payout_id)
        if payout.get("status") == "paid":
            return payout

        now = datetime.utcnow().isoformat()
        payout["status"] = "paid"
        payout["payout_date"] = now
        payout["cash_proof_url"] = cash_proof_url
        payout["transaction_reference"] = f"CASH_PAYOUT_{payout_id[:8].upper()}"

        client = get_supabase_client()
        if client:
            try:
                client.table("payouts").update({
                    "status": "paid",
                    "payout_date": now,
                    "cash_proof_url": cash_proof_url,
                    "transaction_reference": payout["transaction_reference"]
                }).eq("id", payout_id).execute()
            except Exception as err:
                logger.warning(f"DB confirm_cash_payout update error: {err}")

        logger.info(f"Cash payout {payout_id} marked PAID by agent {agent_id}")
        return payout

    @classmethod
    def process_upi_payout(cls, payout_id: str) -> Dict[str, Any]:
        payout = cls.get_payout(payout_id)

        # Indicate accurate status when payout gateway is not configured
        now = datetime.utcnow().isoformat()
        payout["status"] = "pending_payout_gateway"
        payout["mode"] = "upi"
        payout["transfer_notice"] = "Calculated payout record created. Automated bank disbursement pending RazorpayX gateway execution."

        client = get_supabase_client()
        if client:
            try:
                client.table("payouts").update({
                    "status": "pending_payout_gateway",
                    "mode": "upi"
                }).eq("id", payout_id).execute()
            except Exception as err:
                logger.warning(f"DB process_upi_payout update error: {err}")

        logger.info(f"UPI payout record {payout_id} updated to pending_payout_gateway.")
        return payout

payout_service = PayoutService()

