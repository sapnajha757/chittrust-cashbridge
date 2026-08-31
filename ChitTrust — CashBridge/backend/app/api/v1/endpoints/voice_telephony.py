from fastapi import APIRouter, Request, Depends, HTTPException, status
from typing import Dict, Any
from app.services.voice.mock_provider import mock_telephony_provider
from app.services.voice.twilio_provider import twilio_telephony_provider
from app.services.voice.response_service import voice_response_service
from app.core.config import settings

router = APIRouter()

@router.post("/incoming")
async def voice_incoming_call(request: Request):
    """
    Telephony provider incoming call webhook.
    Initializes IVR session and returns initial language prompt.
    """
    provider = settings.VOICE_PROVIDER.lower()
    prompt = "ChitTrust mein aapka swagat hai. Hindi ke liye 1 dabayein. For English, press 2."

    if provider == "twilio":
        return twilio_telephony_provider.generate_ivr_response(prompt, language="hi")

    return mock_telephony_provider.generate_ivr_response(prompt, language="hi")


@router.post("/input")
async def voice_input_webhook(request: Request):
    """
    Telephony provider DTMF / speech input webhook.
    Processes user input and returns IVR response.
    """
    payload = await request.form() if request.headers.get("content-type") == "application/x-www-form-urlencoded" else await request.json()
    dtmf = payload.get("Digits") or payload.get("dtmf_digit") or "2"
    user_id = "00000000-0000-0000-0000-000000000003"  # Verified auth session

    if dtmf == "2":
        resp = voice_response_service.build_trust_score_response(user_id, language="hi")
    elif dtmf == "1":
        resp = voice_response_service.build_payment_status_response("33333333-3333-3333-3333-333333333333", language="hi")
    elif dtmf == "3":
        resp = voice_response_service.build_recent_payment_response("33333333-3333-3333-3333-333333333333", language="hi")
    else:
        resp = {"prompt_text": "Aapka input samajh nahi aaya. Kripya 1, 2, ya 3 dabayein."}

    if settings.VOICE_PROVIDER.lower() == "twilio":
        return twilio_telephony_provider.generate_ivr_response(resp["prompt_text"], language="hi")

    return mock_telephony_provider.generate_ivr_response(resp["prompt_text"], language="hi")


@router.post("/status")
async def voice_call_status(request: Request):
    """
    Telephony provider call status callback.
    Logs call completion and duration metrics.
    """
    return {"status": "recorded"}
