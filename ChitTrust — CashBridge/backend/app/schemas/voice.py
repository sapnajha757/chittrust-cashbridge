from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class VoiceSimulationRequest(BaseModel):
    user_id: Optional[str] = None
    language: str = Field("hi", pattern="^(hi|en)$")
    pin: Optional[str] = Field(None, min_length=4, max_length=4)
    dtmf_digit: Optional[str] = Field(None, pattern="^[0-9#*]$")
    speech_text: Optional[str] = None

class VoiceSimulationResponse(BaseModel):
    session_id: str
    state: str
    language: str
    prompt_text: str
    spoken_hindi: Optional[str] = None
    intent: Optional[str] = None
    trust_score: Optional[int] = None
    audio_url: Optional[str] = None
    ended: bool = False

class VoicePinSetupRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern="^\\d{4}$")

class VoicePinVerifyRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern="^\\d{4}$")

class VoicePinResponse(BaseModel):
    success: bool
    message: str
    failed_attempts: int = 0
    locked_until: Optional[datetime] = None
