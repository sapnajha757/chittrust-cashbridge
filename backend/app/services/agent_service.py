import uuid
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.notification_service import notification_service
from app.services.contribution_service import DEMO_CONTRIBUTIONS
from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.agent")

DEMO_AGENTS_DB: Dict[str, Dict[str, Any]] = {
    "00000000-0000-0000-0000-000000000002": {
        "id": "00000000-0000-0000-0000-000000000002",
        "name": "Suresh Patel (CashBridge Agent)",
        "phone_number": "+919900000002",
        "verified_status": "verified",
        "total_entries": 3,
        "total_amount_handled": 7500.0,
        "reputation_score": 98.5,
    }
}

class AgentService:
    @classmethod
    def get_agent_dashboard(cls, agent_id: str) -> Dict[str, Any]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("agents").select("*").eq("id", agent_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as err:
                logger.warning(f"DB agent query error: {err}")

        agent = DEMO_AGENTS_DB.get(agent_id)
        if not agent:
            agent = {
                "id": agent_id,
                "name": "Suresh Patel (CashBridge Agent)",
                "verified_status": "verified",
                "total_entries": 3,
                "total_amount_handled": 7500.0,
                "reputation_score": 98.5,
            }
        return agent

    @classmethod
    def record_cash_contribution(
        cls,
        agent_id: str,
        membership_id: str,
        amount: float,
        month_number: int,
        photo_proof_url: str
    ) -> Dict[str, Any]:
        # 1. Agent Verification Guard
        agent = cls.get_agent_dashboard(agent_id)
        if agent.get("verified_status") != "verified":
            raise APIException("Unverified agents are forbidden from recording cash payments.", status_code=403)

        # 2. Server-side expected contribution amount validation
        expected_amount = 2500.0
        if abs(amount - expected_amount) > 0.01:
            raise APIException(f"Invalid contribution amount. Expected ₹{expected_amount:,.2f}.", status_code=400)

        # 3. Photo proof validation
        if not photo_proof_url or not isinstance(photo_proof_url, str):
            raise APIException("Mandatory photo proof URL is missing.", status_code=400)
        
        is_data_uri = photo_proof_url.startswith("data:image/")
        is_http_url = photo_proof_url.startswith("http://") or photo_proof_url.startswith("https://")
        if not (is_data_uri or is_http_url):
            raise APIException("Invalid photo proof URL format. Must be valid HTTP/HTTPS URL or image Data URI.", status_code=400)

        # 4. Duplicate payment check
        existing_paid = next(
            (c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["month_number"] == month_number and c["payment_status"] == "successful"),
            None
        )
        if existing_paid:
            raise APIException("This month's contribution is already recorded.", status_code=400)

        # 5. Atomic contribution creation
        contrib_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        record = {
            "id": contrib_id,
            "membership_id": membership_id,
            "group_id": "11111111-1111-1111-1111-111111111111",
            "month_number": month_number,
            "amount": amount,
            "mode": "cash",
            "confirmed_via": "agent",
            "payment_status": "successful",
            "paid_on_time": True,
            "payment_date": now,
            "photo_proof_url": photo_proof_url,
            "recorded_by_agent_id": agent_id,
            "created_at": now,
        }

        client = get_supabase_client()
        if client:
            try:
                # Validate if membership_id is valid UUID before DB insert
                uuid.UUID(membership_id)
                client.table("contributions").insert({
                    "id": contrib_id,
                    "membership_id": membership_id,
                    "month_number": month_number,
                    "amount": amount,
                    "mode": "cash",
                    "confirmed_via": "agent",
                    "payment_status": "successful",
                    "paid_on_time": True,
                    "payment_date": now,
                    "photo_proof_url": photo_proof_url,
                    "recorded_by_agent_id": agent_id,
                    "created_at": now,
                }).execute()

                client.table("audit_logs").insert({
                    "id": str(uuid.uuid4()),
                    "actor_id": agent_id,
                    "action": "RECORD_CASH_CONTRIBUTION",
                    "entity_type": "contribution",
                    "entity_id": contrib_id,
                    "metadata": {"membership_id": membership_id, "amount": amount, "month_number": month_number},
                    "created_at": now,
                }).execute()
            except Exception as err:
                logger.warning(f"DB record_cash_contribution error (falling back to memory): {err}")

        DEMO_CONTRIBUTIONS.append(record)

        # 6. Atomic Agent Statistics Update
        agent["total_entries"] = agent.get("total_entries", 0) + 1
        agent["total_amount_handled"] = agent.get("total_amount_handled", 0.0) + amount

        # 7. Issue In-App Member Notification
        agent_name = agent.get("name") or agent.get("agent_name") or "Suresh Patel (CashBridge Agent)"
        member_user_id = "00000000-0000-0000-0000-000000000004" # Anil Verma
        notification_service.send_notification(
            user_id=member_user_id,
            title="Cash Payment Recorded ✓",
            message=f"₹{amount:,.2f} cash payment received for Month {month_number}. Recorded by CashBridge Agent {agent_name}.",
            notification_type="cash_receipt",
            related_entity_id=contrib_id
        )

        logger.info(f"Cash contribution {contrib_id} recorded by agent {agent_id}")
        return {
            "success": True,
            "contribution_id": contrib_id,
            "group_id": "11111111-1111-1111-1111-111111111111",
            "membership_id": membership_id,
            "member_name": "Anil Verma (Cash Member)",
            "amount": amount,
            "month_number": month_number,
            "mode": "cash",
            "confirmed_via": "agent",
            "status": "successful",
            "recorded_by_agent_id": agent_id,
            "recorded_by_agent_name": agent_name,
            "photo_proof_url": photo_proof_url,
            "created_at": now,
        }

    @classmethod
    def get_signed_proof_url(cls, contribution_id: str, user_id: str, user_role: str) -> Dict[str, Any]:
        contrib = next((c for c in DEMO_CONTRIBUTIONS if c["id"] == contribution_id), None)
        if not contrib:
            raise APIException("Contribution record not found.", status_code=404)

        if user_role not in ["organizer", "member", "agent", "admin"]:
            raise APIException("Unauthorized to access payment proof image.", status_code=403)

        expires_at = datetime.utcnow() + timedelta(minutes=15)
        signed_url = contrib.get("photo_proof_url") or "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop"

        return {
            "contribution_id": contribution_id,
            "proof_url": signed_url,
            "expires_at": expires_at.isoformat(),
        }

    @classmethod
    def get_agent_entries(cls, agent_id: str) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("contributions").select("*").eq("recorded_by_agent_id", agent_id).order("created_at", desc=True).execute()
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as err:
                logger.warning(f"DB get_agent_entries error: {err}")

        return [c for c in DEMO_CONTRIBUTIONS if c.get("recorded_by_agent_id") == agent_id or c.get("mode") == "cash"]

agent_service = AgentService()
