import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.notification_service import notification_service

logger = logging.getLogger("chittrust.risk")

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
        "type": "UNUSUAL_VOLUME",
        "severity": "MEDIUM",
        "score": 20,
        "description": "Agent recorded 27 doorstep cash entries within a short period, significantly above historical baseline. Needs review.",
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
    def list_flags(cls, organizer_id: str, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        flags = DEMO_RISK_FLAGS_DB
        if status_filter:
            flags = [f for f in flags if f["status"] == status_filter]
        return flags

    @classmethod
    def get_flag(cls, flag_id: str) -> Dict[str, Any]:
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
        DEMO_RISK_FLAGS_DB.append(record)

        # Issue in-app alert to organizer
        notification_service.send_notification(
            user_id="00000000-0000-0000-0000-000000000001",
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

        flag["status"] = status
        flag["resolved_at"] = now
        flag["resolved_by"] = resolved_by
        flag["resolution_note"] = resolution_note

        logger.info(f"Risk flag {flag_id} updated to {status}: {resolution_note}")
        return flag

risk_engine = RiskEngine()
