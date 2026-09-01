import os
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("chittrust.voice.tts")

class BaseTTSProvider:
    def synthesize(self, text: str, language: str = "hi") -> Dict[str, Any]:
        raise NotImplementedError

class RealTTSProvider(BaseTTSProvider):
    def synthesize(self, text: str, language: str = "hi") -> Dict[str, Any]:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.info("OPENAI_API_KEY absent. Falling back to Mock TTS provider.")
            return MockTTSProvider().synthesize(text, language)
        try:
            import openai
            client = openai.OpenAI(api_key=api_key)
            response = client.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=text,
            )
            return {
                "text": text,
                "language": language,
                "audio_bytes": response.content,
                "provider": "real_openai_tts",
            }
        except Exception as err:
            logger.error(f"RealTTSProvider synthesis failed: {err}. Falling back to mock.")
            return MockTTSProvider().synthesize(text, language)

class MockTTSProvider(BaseTTSProvider):
    def synthesize(self, text: str, language: str = "hi") -> Dict[str, Any]:
        logger.info(f"MockTTSProvider synthesis [{language}]: {text}")
        audio_url = f"https://api.chittrust.org/dev/audio?text={text[:30]}"
        return {
            "text": text,
            "language": language,
            "audio_url": audio_url,
            "provider": "mock_tts",
        }

class TextToSpeechService:
    @classmethod
    def get_provider(cls) -> BaseTTSProvider:
        if os.getenv("OPENAI_API_KEY"):
            return RealTTSProvider()
        return MockTTSProvider()

    @classmethod
    def synthesize_speech(cls, text: str, language: str = "hi") -> Dict[str, Any]:
        provider = cls.get_provider()
        return provider.synthesize(text, language)

    @classmethod
    def get_provider_mode(cls) -> str:
        return "real_openai_tts" if os.getenv("OPENAI_API_KEY") else "mock_tts"

tts_service = TextToSpeechService()
