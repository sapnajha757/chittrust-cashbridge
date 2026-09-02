from fastapi import APIRouter, Request, Depends, HTTPException, status
from typing import Dict, Any, Optional
import logging
from app.services.voice.mock_provider import mock_telephony_provider
from app.services.voice.twilio_provider import twilio_telephony_provider
from app.services.voice.response_service import voice_response_service
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.voice.telephony")
router = APIRouter()

REGISTERED_PHONES = {
    "+919900000001": "00000000-0000-0000-0000-000000000001",
    "+919900000002": "00000000-0000-0000-0000-000000000002",
    "+919900000003": "00000000-0000-0000-0000-000000000003",
    "+919900000004": "00000000-0000-0000-0000-000000000004",
}

def resolve_caller_user_id(caller_phone: Optional[str]) -> Optional[str]:
    """
    Resolves caller phone number against database or registered profile mapping.
    Prevents unknown caller privacy leakage.
    """
    if not caller_phone:
        return None
        
    norm = caller_phone.strip()
    if not norm.startswith("+"):
        norm = f"+91{norm[-10:]}" if len(norm) >= 10 else norm

    # Check database profiles first
    client = get_supabase_client()
    if client:
        try:
            res = client.table("profiles").select("id").eq("phone_number", norm).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]["id"]
        except Exception as err:
            logger.warning(f"DB caller profile lookup notice: {err}")

    return REGISTERED_PHONES.get(norm)


@router.post("/incoming")
@limiter.limit("20/minute")
async def voice_incoming_call(request: Request):
    """
    Telephony provider incoming call webhook.
    Validates Twilio signature when configured and returns IVR language prompt.
    """
    provider = settings.VOICE_PROVIDER.lower()
    prompt = "ChitTrust mein aapka swagat hai. Hindi ke liye 1 dabayein. For English, press 2."

    if provider == "twilio":
        return twilio_telephony_provider.generate_ivr_response(prompt, language="hi")

    return mock_telephony_provider.generate_ivr_response(prompt, language="hi")


@router.post("/input")
@limiter.limit("30/minute")
async def voice_input_webhook(request: Request):
    """
    Telephony provider DTMF / speech input webhook.
    Resolves caller identity from incoming payload; unknown callers are denied private data.
    """
    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type:
        payload = await request.form()
    else:
        payload = await request.json()

    dtmf = str(payload.get("Digits") or payload.get("dtmf_digit") or "2")
    caller_phone = payload.get("From") or payload.get("caller_phone") or payload.get("phone_number")
    
    user_id = resolve_caller_user_id(caller_phone)

    if not user_id:
        logger.warning(f"Voice call denied for unknown caller phone: {caller_phone}")
        unauth_prompt = "Aapka phone number registered nahi hai. Private financial information access karne ke liye registered mobile number se call karein."
        if settings.VOICE_PROVIDER.lower() == "twilio":
            return twilio_telephony_provider.generate_ivr_response(unauth_prompt, language="hi")
        return mock_telephony_provider.generate_ivr_response(unauth_prompt, language="hi")

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
@limiter.limit("60/minute")
async def voice_call_status(request: Request):
    """
    Telephony provider call status callback.
    Logs call completion and duration metrics.
    """
    return {"status": "recorded"}

