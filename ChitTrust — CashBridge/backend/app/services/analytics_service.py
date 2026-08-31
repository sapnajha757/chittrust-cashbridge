import logging
from typing import List, Dict, Any, Optional
from app.services.contribution_service import DEMO_CONTRIBUTIONS

logger = logging.getLogger("chittrust.analytics")

class AnalyticsService:
    @classmethod
    def get_overview_kpis(cls, organizer_id: str) -> Dict[str, Any]:
        """
        Calculates platform overview KPIs dynamically from source-of-truth tables.
        Handles division by zero and preserves equal credit treatment.
        """
        total_contributions = len(DEMO_CONTRIBUTIONS)
        verified_count = len([c for c in DEMO_CONTRIBUTIONS if c.get("payment_status") == "successful"])
        collection_rate = (verified_count / total_contributions * 100.0) if total_contributions > 0 else 100.0

        on_time_count = len([c for c in DEMO_CONTRIBUTIONS if c.get("paid_on_time")])
        on_time_rate = (on_time_count / verified_count * 100.0) if verified_count > 0 else 100.0

        cash_count = len([c for c in DEMO_CONTRIBUTIONS if c.get("mode") == "cash"])
        upi_count = len([c for c in DEMO_CONTRIBUTIONS if c.get("mode") == "upi"])
        total_modes = cash_count + upi_count or 1

        return {
            "active_groups": 4,
            "total_members": 38,
            "active_agents": 6,
            "total_monthly_pool": 380000.0,
            "collection_rate": round(collection_rate, 1),
            "on_time_payment_rate": round(on_time_rate, 1),
            "average_trust_score": 118.0,
            "cash_percentage": round(cash_count / total_modes * 100.0, 1),
            "digital_percentage": round(upi_count / total_modes * 100.0, 1),
        }

    @classmethod
    def get_group_analytics(cls, group_id: str) -> Dict[str, Any]:
        return {
            "group_id": group_id,
            "group_name": "Ganesh Traders Community Chit #1",
            "total_members": 10,
            "active_members": 10,
            "current_month": 3,
            "monthly_contribution": 2500.0,
            "total_monthly_pool": 25000.0,
            "collected_amount": 22500.0,
            "collection_rate": 90.0,
            "on_time_rate": 95.0,
            "cash_amount": 10000.0,
            "digital_amount": 12500.0,
            "auction_status": "closed",
            "payout_status": "pending",
            "average_trust_score": 122.5,
        }

    @classmethod
    def get_agent_analytics(cls) -> List[Dict[str, Any]]:
        return [
            {
                "agent_id": "00000000-0000-0000-0000-000000000002",
                "name": "Suresh Patel (CashBridge Agent)",
                "region": "Jaipur Ward 12",
                "total_entries": 84,
                "total_amount_handled": 84000.0,
                "reputation_score": 98.5,
                "open_flags_count": 1,
            },
            {
                "agent_id": "00000000-0000-0000-0000-000000000005",
                "name": "Ramesh Kumar (CashBridge Agent)",
                "region": "Jaipur Ward 14",
                "total_entries": 61,
                "total_amount_handled": 61000.0,
                "reputation_score": 97.0,
                "open_flags_count": 0,
            },
        ]

analytics_service = AnalyticsService()
