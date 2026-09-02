import json
import logging
import requests
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.exceptions import APIException

logger = logging.getLogger("chittrust.ai.providers")

class BaseAIProvider:
    def generate_explanation(self, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

class GroqProvider(BaseAIProvider):
    """
    Real Groq LLM API provider using llama-3.3-70b-versatile or llama3-8b-8192.
    Strictly uses database factual context to generate natural language explanations.
    Fails loudly with HTTP 503 if GROQ_API_KEY is missing or Groq API call fails.
    """
    def generate_explanation(self, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        api_key = settings.GROQ_API_KEY
        if not api_key or "placeholder" in api_key:
            logger.error("GROQ_API_KEY is missing or unconfigured.")
            raise APIException("AI intelligence service unavailable: GROQ_API_KEY is not configured.", status_code=503)

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

            models_to_try = [
                "qwen/qwen3.6-27b",
                "llama-3.3-70b-versatile",
                "llama3-8b-8192",
                "openai/gpt-oss-20b"
            ]

            last_error = None
            for model_name in models_to_try:
                payload = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg}
                    ],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"}
                }

                response = requests.post(url, headers=headers, json=payload, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    parsed["confidence"] = parsed.get("confidence", 0.90)
                    return parsed
                elif response.status_code == 404:
                    last_error = response.text
                    continue
                else:
                    logger.error(f"Groq API returned HTTP {response.status_code}: {response.text}")
                    raise APIException(f"AI intelligence API error: HTTP {response.status_code}", status_code=503)

            logger.error(f"All Groq models failed: {last_error}")
            raise APIException("AI intelligence API error: All configured models failed.", status_code=503)
        except APIException:
            raise
        except Exception as err:
            logger.error(f"GroqProvider execution failed: {err}")
            raise APIException(f"AI intelligence service failure: {str(err)}", status_code=503)

def get_ai_provider() -> BaseAIProvider:
    return GroqProvider()

