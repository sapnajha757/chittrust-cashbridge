from typing import Dict, Any, List
from app.services.trust_score_service import trust_score_service

class TrustScoreExplanationService:
    @classmethod
    def generate_explanation(cls, user_id: str) -> Dict[str, Any]:
        snapshot = trust_score_service.get_user_trust_score(user_id)
        score = snapshot["score"]
        on_time = snapshot["total_on_time"]
        streak = snapshot["current_streak"]
        bonus = snapshot["total_bonus_points"]

        factors = []
        if on_time > 0:
            factors.append(f"✓ {on_time} on-time contribution(s) recorded (+{on_time * 5} points)")
        if streak > 0:
            factors.append(f"🔥 Active {streak}-month consecutive on-time payment streak")
        if bonus > 0:
            factors.append(f"🌟 Consistency milestone bonus earned (+{bonus} points)")
        if snapshot["total_late"] > 0:
            factors.append(f"⚠️ {snapshot['total_late']} late contribution(s)")
        if snapshot["total_missed"] > 0:
            factors.append(f"❌ {snapshot['total_missed']} missed payment(s)")

        if not factors:
            factors.append("Starting base score (100 points)")

        summary = f"Your current ChitTrust score is {score}. You have completed {on_time} on-time payment(s) with an active streak of {streak} month(s). Cash and UPI payments receive equal credit."

        return {
            "user_id": user_id,
            "score": score,
            "explanation_summary": summary,
            "key_factors": factors,
            "disclaimer": "Trust Score reflects contribution consistency within ChitTrust. It is not a bank credit score or guarantee of creditworthiness.",
        }

trust_score_explanation_service = TrustScoreExplanationService()
