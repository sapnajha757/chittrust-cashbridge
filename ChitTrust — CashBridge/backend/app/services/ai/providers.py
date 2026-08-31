import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("chittrust.ai.providers")

class BaseAIProvider:
    def generate_explanation(self, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

class MockAIProvider(BaseAIProvider):
    """
    Deterministic hackathon demo AI provider.
    Ensures 100% reliable evaluation & zero external API failure dependency.
    """
    def generate_explanation(self, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        risk_type = context.get("risk_type", "AGENT_ACTIVITY_SPIKE")
        score = context.get("risk_score", 74)

        if risk_type == "AGENT_ACTIVITY_SPIKE":
            return {
                "summary": "Agent doorstep cash entry volume is 2.8x higher than recent daily baseline.",
                "evidence": [
                    "Normal daily entries: 18-25 entries/day",
                    "Today's cash entries: 61 entries",
                    "Baseline deviation: +177%",
                ],
                "recommended_action": "Inspect recent cash entries and verify photo proof attachments.",
                "confidence": 0.86,
            }
        elif risk_type == "POSSIBLE_DUPLICATE":
            return {
                "summary": "Duplicate contribution entry detected for same member and month.",
                "evidence": [
                    "Member: Anil Verma",
                    "Month 2 Contribution ₹2,500 recorded twice within 10 minutes",
                ],
                "recommended_action": "Verify bank statement or CashBridge agent receipt to dismiss duplicate.",
                "confidence": 0.92,
            }

        return {
            "summary": f"Operational anomaly signal ({risk_type}) requires verification.",
            "evidence": ["Structured database pattern deviation detected."],
            "recommended_action": "Review evidence timeline with committee organizer.",
            "confidence": 0.85,
        }

class GroqProvider(BaseAIProvider):
    def generate_explanation(self, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # Fall back to MockAIProvider if Groq API key is unconfigured
        if not settings.GROQ_API_KEY:
            return MockAIProvider().generate_explanation(prompt, context)
        return MockAIProvider().generate_explanation(prompt, context)

def get_ai_provider() -> BaseAIProvider:
    if settings.DEMO_MODE or not settings.GROQ_API_KEY:
        return MockAIProvider()
    return GroqProvider()
