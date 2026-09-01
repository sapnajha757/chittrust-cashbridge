from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseTelephonyProvider(ABC):
    @abstractmethod
    def generate_ivr_response(self, prompt_text: str, language: str = "hi", gather_dtmf: bool = True) -> Any:
        """Generates provider-specific IVR response (TwiML / Exotel JSON / Mock JSON)."""
        pass

    @abstractmethod
    def parse_incoming_webhook(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Parses raw telephony provider webhook into standardized internal event format."""
        pass
