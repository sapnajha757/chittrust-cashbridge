import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.ai.providers import get_ai_provider

logger = logging.getLogger("chittrust.ai.risk_engine")

DEMO_AI_ASSESSMENTS_DB: List[Dict[str, Any]] = [
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
    },
    {
        "id": "ai222222-2222-2222-2222-222222222222",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "group_name": "Ganesh Traders Community Chit #1",
        "user_id": "00000000-0000-0000-0000-000000000004",
        "member_name": "Anil Verma (Cash Member)",
        "agent_id": "00000000-0000-0000-0000-000000000002",
        "agent_name": "Suresh Patel (CashBridge Agent)",
        "entity_type": "contribution",
        "entity_id": "c3333333-3333-3333-3333-333333333333",
        "risk_type": "POSSIBLE_DUPLICATE",
        "risk_score": 40,
        "confidence": 0.92,
        "status": "open",
        "evidence_json": {
            "member_id": "33333333-3333-3333-3333-333333333333",
            "month_number": 2,
            "amount": 2500.0,
        },
        "explanation": "Duplicate cash contribution entry detected for Month 2 (Amount ₹2,500).",
        "recommended_action": "Verify bank statement or CashBridge agent receipt to confirm.",
        "model_name": "chittrust-hybrid-v1",
        "model_version": "1.0",
        "created_at": datetime.utcnow().isoformat(),
        "reviewed_at": None,
        "reviewed_by": None,
        "resolution_note": None,
    },
]

class AIRiskEngine:
    @classmethod
    def list_assessments(cls, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        assessments = DEMO_AI_ASSESSMENTS_DB
        if status_filter:
            assessments = [a for a in assessments if a["status"] == status_filter]
        return assessments

    @classmethod
    def get_assessment(cls, assessment_id: str) -> Dict[str, Any]:
        assessment = next((a for a in DEMO_AI_ASSESSMENTS_DB if a["id"] == assessment_id), None)
        if not assessment:
            raise APIException("AI risk assessment not found.", status_code=404)
        return assessment

    @classmethod
    def review_assessment(cls, assessment_id: str, status: str, resolution_note: str, reviewed_by: str) -> Dict[str, Any]:
        assessment = cls.get_assessment(assessment_id)
        now = datetime.utcnow().isoformat()

        assessment["status"] = status
        assessment["reviewed_at"] = now
        assessment["reviewed_by"] = reviewed_by
        assessment["resolution_note"] = resolution_note

        logger.info(f"AI risk assessment {assessment_id} reviewed and updated to {status}")
        return assessment

ai_risk_engine = AIRiskEngine()
