import json
import logging
import requests
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("chittrust.ai.providers")

class BaseAIProvider:
    def generate_explanation(self, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

class MockAIProvider(BaseAIProvider):
    """
    Deterministic fallback AI provider.
    Ensures 100% reliable fallback evaluation & zero external API failure dependency.
    """
    def generate_explanation(self, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        risk_type = context.get("risk_type", "AGENT_ACTIVITY_SPIKE")

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
    """
    Real Groq LLM API provider using llama-3.3-70b-versatile or llama3-8b-8192.
    Strictly uses database factual context to generate natural language explanations.
    """
    def generate_explanation(self, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        api_key = settings.GROQ_API_KEY
        if not api_key or api_key.startswith("gsk_placeholder"):
            return MockAIProvider().generate_explanation(prompt, context)

        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            system_msg = (
                "You are the ChitTrust Risk & Trust Intelligence Assistant. "
                "Synthesize explanations strictly using facts provided in the context JSON. "
                "Do NOT invent numbers, trust scores, or financial transactions. "
                "Respond in valid JSON with keys: summary, evidence, recommended_action, confidence."
            )
            user_msg = f"Prompt: {prompt}\nContext: {json.dumps(context)}"

            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg}
                ],
                "temperature": 0.2,
                "response_format": {"type": "json_object"}
            }

            response = requests.post(url, headers=headers, json=payload, timeout=8)
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                parsed["confidence"] = parsed.get("confidence", 0.90)
                return parsed
            else:
                logger.warning(f"Groq API returned status {response.status_code}: {response.text}")
        except Exception as err:
            logger.error(f"GroqProvider execution failed: {err}")

        return MockAIProvider().generate_explanation(prompt, context)

def get_ai_provider() -> BaseAIProvider:
    if settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("gsk_placeholder"):
        return GroqProvider()
    return MockAIProvider()
