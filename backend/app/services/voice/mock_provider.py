import uuid
from typing import Dict, Any, Optional
from app.services.voice.base_provider import BaseTelephonyProvider

class MockTelephonyProvider(BaseTelephonyProvider):
    def generate_ivr_response(self, prompt_text: str, language: str = "hi", gather_dtmf: bool = True) -> Dict[str, Any]:
        return {
            "provider": "mock",
            "prompt_text": prompt_text,
            "language": language,
            "gather_dtmf": gather_dtmf,
        }

    def parse_incoming_webhook(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "provider_call_id": request_payload.get("call_id", str(uuid.uuid4())),
            "caller_phone_hash": "hash_demo_phone",
            "dtmf_digit": request_payload.get("dtmf_digit"),
            "speech_text": request_payload.get("speech_text"),
        }

mock_telephony_provider = MockTelephonyProvider()
