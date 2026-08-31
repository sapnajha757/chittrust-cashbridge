import logging
from typing import Dict, Any, List
from app.services.ai.providers import get_ai_provider

logger = logging.getLogger("chittrust.ai.explanation")

class AIExplanationService:
    @classmethod
    def generate_risk_explanation(cls, risk_type: str, risk_score: int, evidence: Dict[str, Any]) -> Dict[str, Any]:
        provider = get_ai_provider()
        context = {
            "risk_type": risk_type,
            "risk_score": risk_score,
            "evidence": evidence,
        }

        try:
            return provider.generate_explanation("risk_explanation_v1", context)
        except Exception as err:
            logger.error(f"AI Provider failed: {err}. Falling back to rule-based explanation.")
            return {
                "summary": f"Operational signal ({risk_type}) requires review.",
                "evidence": ["Structured database pattern deviation detected."],
                "recommended_action": "Review evidence timeline with committee organizer.",
                "confidence": 0.85,
            }

ai_explanation_service = AIExplanationService()
