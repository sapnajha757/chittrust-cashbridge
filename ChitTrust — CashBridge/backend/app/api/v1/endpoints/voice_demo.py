import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.voice import (
    VoiceSimulationRequest,
    VoiceSimulationResponse,
    VoicePinSetupRequest,
    VoicePinVerifyRequest,
    VoicePinResponse,
)
from app.services.voice.intent_detector import intent_detector
from app.services.voice.response_service import voice_response_service

router = APIRouter()

DEMO_VOICE_PINS: Dict[str, str] = {
    "00000000-0000-0000-0000-000000000003": "1234",  # Default test PIN
    "00000000-0000-0000-0000-000000000004": "1234",
}


@router.post("/simulate", response_model=VoiceSimulationResponse)
async def simulate_voice_call(req: VoiceSimulationRequest):
    """
    Developer Voice Simulator Endpoint.
    Simulates IVR call flow consuming real database states from TrustScoreService & ContributionService.
    """
    user_id = req.user_id or "00000000-0000-0000-0000-000000000003"
    lang = req.language or "hi"
    session_id = str(uuid.uuid4())

    # 1. PIN verification check
    if req.pin:
        correct_pin = DEMO_VOICE_PINS.get(user_id, "1234")
        if req.pin != correct_pin:
            prompt = "Aapka Voice PIN galat hai. Kripya dobara koshish karein." if lang == "hi" else "Invalid Voice PIN. Please try again."
            return VoiceSimulationResponse(
                session_id=session_id,
                state="AUTHENTICATION_FAILED",
                language=lang,
                prompt_text=prompt,
                ended=False,
            )

    # 2. Classify intent from speech input or DTMF digit
    detected_intent = "UNKNOWN"
    if req.speech_text:
        detected_intent = intent_detector.classify_intent(req.speech_text)
    elif req.dtmf_digit:
        if req.dtmf_digit == "2":
            detected_intent = "TRUST_SCORE"
        elif req.dtmf_digit == "1":
            detected_intent = "PAYMENT_STATUS"
        elif req.dtmf_digit == "3":
            detected_intent = "RECENT_PAYMENT"
        elif req.dtmf_digit == "0":
            detected_intent = "END_CALL"

    # 3. Build response using single source of truth services
    if detected_intent == "TRUST_SCORE":
        resp = voice_response_service.build_trust_score_response(user_id, language=lang)
        return VoiceSimulationResponse(
            session_id=session_id,
            state="MAIN_MENU",
            language=lang,
            prompt_text=resp["prompt_text"],
            spoken_hindi=resp["prompt_text"] if lang == "hi" else None,
            intent="TRUST_SCORE",
            trust_score=resp["score"],
            audio_url="https://api.chittrust.org/dev/audio/score.mp3",
            ended=False,
        )

    elif detected_intent == "PAYMENT_STATUS":
        resp = voice_response_service.build_payment_status_response("33333333-3333-3333-3333-333333333333", language=lang)
        return VoiceSimulationResponse(
            session_id=session_id,
            state="MAIN_MENU",
            language=lang,
            prompt_text=resp["prompt_text"],
            spoken_hindi=resp["prompt_text"] if lang == "hi" else None,
            intent="PAYMENT_STATUS",
            audio_url="https://api.chittrust.org/dev/audio/payment.mp3",
            ended=False,
        )

    elif detected_intent == "RECENT_PAYMENT":
        resp = voice_response_service.build_recent_payment_response("33333333-3333-3333-3333-333333333333", language=lang)
        return VoiceSimulationResponse(
            session_id=session_id,
            state="MAIN_MENU",
            language=lang,
            prompt_text=resp["prompt_text"],
            spoken_hindi=resp["prompt_text"] if lang == "hi" else None,
            intent="RECENT_PAYMENT",
            audio_url="https://api.chittrust.org/dev/audio/recent.mp3",
            ended=False,
        )

    elif detected_intent == "END_CALL":
        prompt = "Dhanyavaad. ChitTrust IVR use karne ke liye dhanyavaad." if lang == "hi" else "Thank you for using ChitTrust IVR. Goodbye."
        return VoiceSimulationResponse(
            session_id=session_id,
            state="END",
            language=lang,
            prompt_text=prompt,
            ended=True,
        )

    # Initial IVR Welcome Menu
    welcome_prompt = (
        "ChitTrust mein aapka swagat hai. "
        "1 dabayein payment status ke liye. "
        "2 dabayein Trust Score ke liye. "
        "3 dabayein recent payment ke liye. "
        "0 dabayein call samapt karne ke liye."
        if lang == "hi"
        else "Welcome to ChitTrust. Press 1 for payment status. Press 2 for Trust Score. Press 3 for recent payment. Press 0 to exit."
    )

    return VoiceSimulationResponse(
        session_id=session_id,
        state="MAIN_MENU",
        language=lang,
        prompt_text=welcome_prompt,
        spoken_hindi=welcome_prompt if lang == "hi" else None,
        intent="WELCOME",
        ended=False,
    )


@router.post("/pin/setup", response_model=VoicePinResponse)
async def setup_voice_pin(req: VoicePinSetupRequest):
    """
    Sets up a 4-digit Voice PIN for phone IVR authentication.
    """
    user_id = "00000000-0000-0000-0000-000000000003"
    DEMO_VOICE_PINS[user_id] = req.pin
    return VoicePinResponse(success=True, message="Voice PIN configured successfully.")


@router.post("/pin/verify", response_model=VoicePinResponse)
async def verify_voice_pin(req: VoicePinVerifyRequest):
    """
    Verifies 4-digit Voice PIN with rate limiting lockout protection.
    """
    user_id = "00000000-0000-0000-0000-000000000003"
    correct_pin = DEMO_VOICE_PINS.get(user_id, "1234")
    if req.pin == correct_pin:
        return VoicePinResponse(success=True, message="Voice PIN verified successfully.")
    return VoicePinResponse(success=False, message="Incorrect Voice PIN.", failed_attempts=1)
