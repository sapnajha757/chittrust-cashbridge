import logging
from typing import Dict, Any, List
from app.services.contribution_service import DEMO_CONTRIBUTIONS

logger = logging.getLogger("chittrust.ai.features")

class FeatureEngine:
    @classmethod
    def extract_member_features(cls, user_id: str) -> Dict[str, Any]:
        """
        Extracts anonymized member behavioral features without PII.
        """
        user_contribs = [c for c in DEMO_CONTRIBUTIONS if c.get("membership_id") == "33333333-3333-3333-3333-333333333333"]
        total = len(user_contribs) or 1
        on_time = len([c for c in user_contribs if c.get("paid_on_time")])

        return {
            "user_id": user_id,
            "payment_on_time_ratio": round(on_time / total, 2),
            "late_payment_ratio": round(1.0 - (on_time / total), 2),
            "missed_payment_ratio": 0.0,
            "current_streak": 3,
            "average_payment_delay_days": 0.0,
            "contribution_count": total,
        }

    @classmethod
    def extract_agent_features(cls, agent_id: str) -> Dict[str, Any]:
        """
        Extracts agent performance & operational baseline metrics without PII.
        """
        return {
            "agent_id": agent_id,
            "entries_per_day_baseline": 22.0,
            "entries_today": 61,
            "cash_volume": 84000.0,
            "proof_upload_ratio": 0.98,
            "unusual_hour_ratio": 0.05,
        }

feature_engine = FeatureEngine()
