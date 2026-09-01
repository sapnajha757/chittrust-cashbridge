import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.notification_service import notification_service
from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.risk")

# 7 Explicit Operational & Financial Risk Rules
EXPLICIT_RISK_RULES: List[Dict[str, Any]] = [
    {
        "rule_id": "RULE_01_POSSIBLE_DUPLICATE",
        "name": "Possible Duplicate Payment",
        "description": "Multiple contribution entries recorded for the same membership and month within 10 minutes.",
        "severity": "HIGH",
        "weight": 40,
    },
    {
        "rule_id": "RULE_02_AGENT_ACTIVITY_SPIKE",
        "name": "Agent Doorstep Collection Spike",
        "description": "Agent daily cash collection volume is 2.5x higher than recent baseline.",
        "severity": "HIGH",
        "weight": 30,
    },
    {
        "rule_id": "RULE_03_UNUSUAL_HANDOVER_DELAY",
        "name": "Unusual Cash Handover Delay",
        "description": "Time gap between doorstep cash receipt and agent server entry exceeds 24 hours.",
        "severity": "MEDIUM",
        "weight": 25,
    },
    {
        "rule_id": "RULE_04_MISSING_PHOTO_PROOF",
        "name": "Missing Handover Photo Proof",
        "description": "Doorstep cash transaction submitted without valid proof photo URL.",
        "severity": "HIGH",
        "weight": 35,
    },
    {
        "rule_id": "RULE_05_EXCESSIVE_AUCTION_DISCOUNT",
        "name": "Excessive Auction Discount Bid",
        "description": "Bidding discount submission exceeds 40% of total group pot.",
        "severity": "MEDIUM",
        "weight": 20,
    },
    {
        "rule_id": "RULE_06_SUDDEN_STATUS_CHANGE",
        "name": "Sudden Member Exits Pattern",
        "description": "Multiple member exit requests submitted within a 7-day period.",
        "severity": "LOW",
        "weight": 15,
    },
    {
        "rule_id": "RULE_07_HIGH_RISK_MEMBER_PATTERN",
        "name": "Repeated Late / Missed Payments",
        "description": "Member accumulated 3 or more consecutive late or missed monthly payments.",
        "severity": "HIGH",
        "weight": 30,
    },
]

DEMO_RISK_FLAGS_DB: List[Dict[str, Any]] = [
    {
        "id": "r1111111-1111-1111-1111-111111111111",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "group_name": "Ganesh Traders Community Chit #1",
        "user_id": "00000000-0000-0000-0000-000000000004",
        "member_name": "Anil Verma (Cash Member)",
        "agent_id": "00000000-0000-0000-0000-000000000002",
        "agent_name": "Suresh Patel (CashBridge Agent)",
        "type": "POSSIBLE_DUPLICATE",
        "severity": "HIGH",
        "score": 40,
        "description": "Possible duplicate cash contribution entry detected for Month 2 (Amount ₹2,500). Needs review.",
        "entity_type": "contribution",
        "entity_id": "c3333333-3333-3333-3333-333333333333",
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
        "resolved_at": None,
        "resolved_by": None,
        "resolution_note": None,
    },
    {
        "id": "r2222222-2222-2222-2222-222222222222",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "group_name": "Ganesh Traders Community Chit #1",
        "user_id": None,
        "member_name": None,
        "agent_id": "00000000-0000-0000-0000-000000000002",
        "agent_name": "Suresh Patel (CashBridge Agent)",
        "type": "AGENT_ACTIVITY_SPIKE",
        "severity": "MEDIUM",
        "score": 30,
        "description": "Agent recorded 61 doorstep cash entries within a short period, significantly above historical daily baseline. Needs review.",
        "entity_type": "agent",
        "entity_id": "00000000-0000-0000-0000-000000000002",
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
        "resolved_at": None,
        "resolved_by": None,
        "resolution_note": None,
    },
]

class RiskEngine:
    @classmethod
    def get_rules(cls) -> List[Dict[str, Any]]:
        return EXPLICIT_RISK_RULES

    @classmethod
    def list_flags(cls, organizer_id: Optional[str] = None, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                query = client.table("risk_flags").select("*")
                if status_filter:
                    query = query.eq("status", status_filter)
                res = query.order("created_at", desc=True).execute()
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as err:
                logger.warning(f"DB list_flags error: {err}")

        flags = DEMO_RISK_FLAGS_DB
        if status_filter:
            flags = [f for f in flags if f["status"] == status_filter]
        return flags

    @classmethod
    def get_flag(cls, flag_id: str) -> Dict[str, Any]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("risk_flags").select("*").eq("id", flag_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as err:
                logger.warning(f"DB get_flag error: {err}")

        flag = next((f for f in DEMO_RISK_FLAGS_DB if f["id"] == flag_id), None)
        if not flag:
            raise APIException("Risk review flag not found.", status_code=404)
        return flag

    @classmethod
    def create_flag(
        cls,
        group_id: str,
        flag_type: str,
        severity: str,
        score: int,
        description: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        user_id: Optional[str] = None,
        agent_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        flag_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        record = {
            "id": flag_id,
            "group_id": group_id,
            "group_name": "Ganesh Traders Community Chit #1",
            "user_id": user_id,
            "member_name": "Anil Verma (Cash Member)" if user_id else None,
            "agent_id": agent_id,
            "agent_name": "Suresh Patel (CashBridge Agent)" if agent_id else None,
            "type": flag_type,
            "severity": severity,
            "score": score,
            "description": description,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "status": "open",
            "created_at": now,
            "resolved_at": None,
            "resolved_by": None,
            "resolution_note": None,
        }

        client = get_supabase_client()
        if client:
            try:
                client.table("risk_flags").insert({
                    "id": flag_id,
                    "group_id": group_id,
                    "user_id": user_id,
                    "agent_id": agent_id,
                    "type": flag_type,
                    "severity": severity,
                    "score": score,
                    "description": description,
                    "entity_type": entity_type,
                    "entity_id": entity_id,
                    "status": "open",
                    "created_at": now,
                }).execute()
            except Exception as err:
                logger.warning(f"DB create_flag error: {err}")

        DEMO_RISK_FLAGS_DB.append(record)

        # Issue notification
        notification_service.send_notification(
            user_id=user_id or "00000000-0000-0000-0000-000000000001",
            title="Operational Review Alert ⚠️",
            message=description,
            notification_type="risk_alert",
            related_entity_id=flag_id,
        )

        logger.info(f"Risk flag created: {flag_type} ({severity}) - {description}")
        return record

    @classmethod
    def resolve_flag(cls, flag_id: str, status: str, resolution_note: str, resolved_by: str) -> Dict[str, Any]:
        flag = cls.get_flag(flag_id)
        now = datetime.utcnow().isoformat()

        client = get_supabase_client()
        if client:
            try:
                client.table("risk_flags").update({
                    "status": status,
                    "resolved_at": now,
                    "resolved_by": resolved_by,
                    "resolution_note": resolution_note,
                }).eq("id", flag_id).execute()

                client.table("audit_logs").insert({
                    "id": str(uuid.uuid4()),
                    "actor_id": resolved_by,
                    "action": "RESOLVE_RISK_FLAG",
                    "entity_type": "risk_flag",
                    "entity_id": flag_id,
                    "metadata": {"status": status, "note": resolution_note},
                    "created_at": now,
                }).execute()
            except Exception as err:
                logger.warning(f"DB resolve_flag update error: {err}")

        flag["status"] = status
        flag["resolved_at"] = now
        flag["resolved_by"] = resolved_by
        flag["resolution_note"] = resolution_note

        logger.info(f"Risk flag {flag_id} updated to {status}: {resolution_note}")
        return flag

risk_engine = RiskEngine()
