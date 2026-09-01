import os
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("chittrust.voice.stt")

class BaseSTTProvider:
    def transcribe(self, audio_payload: bytes, language: str = "hi") -> str:
        raise NotImplementedError

class RealWhisperProvider(BaseSTTProvider):
    def transcribe(self, audio_payload: bytes, language: str = "hi") -> str:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.info("OPENAI_API_KEY absent. Falling back to Whisper mock transcription.")
            return MockWhisperProvider().transcribe(audio_payload, language)
        try:
            import openai
            client = openai.OpenAI(api_key=api_key)
            # Transcribe payload using OpenAI Whisper API
            res = client.audio.transcriptions.create(
                model="whisper-1",
                file=("audio.wav", audio_payload, "audio/wav"),
                language=language
            )
            return res.text
        except Exception as err:
            logger.error(f"RealWhisperProvider failed: {err}. Falling back to mock transcription.")
            return MockWhisperProvider().transcribe(audio_payload, language)

class MockWhisperProvider(BaseSTTProvider):
    def transcribe(self, audio_payload: bytes, language: str = "hi") -> str:
        logger.info(f"MockWhisperProvider transcribing payload ({len(audio_payload)} bytes)...")
        if language == "hi":
            return "Mera score kya hai"
        return "What is my trust score"

class SpeechToTextService:
    @classmethod
    def get_provider(cls) -> BaseSTTProvider:
        if os.getenv("OPENAI_API_KEY"):
            return RealWhisperProvider()
        return MockWhisperProvider()

    @classmethod
    def transcribe_audio(cls, audio_payload: bytes, language: str = "hi") -> str:
        provider = cls.get_provider()
        return provider.transcribe(audio_payload, language)

    @classmethod
    def get_provider_mode(cls) -> str:
        return "real_whisper_stt" if os.getenv("OPENAI_API_KEY") else "mock_whisper_stt"

stt_service = SpeechToTextService()
