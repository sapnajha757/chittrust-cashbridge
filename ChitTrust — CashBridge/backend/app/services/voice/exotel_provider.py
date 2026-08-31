from typing import Dict, Any
from app.services.voice.base_provider import BaseTelephonyProvider

class ExotelTelephonyProvider(BaseTelephonyProvider):
    def generate_ivr_response(self, prompt_text: str, language: str = "hi", gather_dtmf: bool = True) -> Dict[str, Any]:
        """
        Generates standard Exotel IVR JSON response.
        """
        return {
            "select": {
                "text": prompt_text,
                "language": "hi-IN" if language == "hi" else "en-US",
                "max_digits": 1 if gather_dtmf else 0,
            }
        }

    def parse_incoming_webhook(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "provider_call_id": request_payload.get("CallSid"),
            "caller_phone_hash": request_payload.get("From"),
            "dtmf_digit": request_payload.get("digits"),
            "speech_text": request_payload.get("speech_result"),
        }

exotel_telephony_provider = ExotelTelephonyProvider()
