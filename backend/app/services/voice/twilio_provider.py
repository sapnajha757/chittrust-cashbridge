from typing import Dict, Any
from app.services.voice.base_provider import BaseTelephonyProvider

class TwilioTelephonyProvider(BaseTelephonyProvider):
    def generate_ivr_response(self, prompt_text: str, language: str = "hi", gather_dtmf: bool = True) -> str:
        """
        Generates standard Twilio TwiML XML string.
        """
        voice_lang = "hi-IN" if language == "hi" else "en-US"
        twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response>'
        if gather_dtmf:
            twiml += f'<Gather numDigits="1" action="/api/v1/voice/input" method="POST"><Say language="{voice_lang}">{prompt_text}</Say></Gather>'
        else:
            twiml += f'<Say language="{voice_lang}">{prompt_text}</Say><Hangup/>'
        twiml += '</Response>'
        return twiml

    def parse_incoming_webhook(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "provider_call_id": request_payload.get("CallSid"),
            "caller_phone_hash": request_payload.get("From"),
            "dtmf_digit": request_payload.get("Digits"),
            "speech_text": request_payload.get("SpeechResult"),
        }

twilio_telephony_provider = TwilioTelephonyProvider()
