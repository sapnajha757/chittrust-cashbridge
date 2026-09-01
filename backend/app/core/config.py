import json
from typing import List, Union, Optional
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ChitTrust + CashBridge API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    APP_ENV: Optional[str] = None
    DEMO_MODE: bool = True
    LOG_LEVEL: str = "INFO"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v

    # Supabase Configuration
    SUPABASE_URL: str = "https://placeholder.supabase.co"
    SUPABASE_ANON_KEY: str = "placeholder_anon_key"
    SUPABASE_SERVICE_ROLE_KEY: str = "placeholder_key"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/chittrust"

    # Razorpay Integration (Test Mode)
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder"
    RAZORPAY_KEY_SECRET: str = "placeholder_secret"
    RAZORPAY_WEBHOOK_SECRET: str = "whsec_placeholder"

    # Voice IVR & Telephony Configuration
    VOICE_PROVIDER: str = "mock"  # mock | twilio | exotel
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    EXOTEL_API_KEY: str = ""
    EXOTEL_API_TOKEN: str = ""
    EXOTEL_PHONE_NUMBER: str = ""
    VOICE_WEBHOOK_SECRET: str = "voice_whsec_placeholder"
    GROQ_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    @model_validator(mode="after")
    def validate_production_hardening(self) -> "Settings":
        effective_env = (self.APP_ENV or self.ENVIRONMENT).lower()

        if effective_env == "production":
            if "*" in self.CORS_ORIGINS:
                raise ValueError("Insecure CORS wildcard '*' is prohibited in production when credentials are enabled.")

            if self.DEMO_MODE:
                object.__setattr__(self, "DEMO_MODE", False)

            # Check critical production credentials
            critical_missing = []
            if not self.SUPABASE_URL or "placeholder" in self.SUPABASE_URL:
                critical_missing.append("SUPABASE_URL")
            if not self.SUPABASE_SERVICE_ROLE_KEY or "placeholder" in self.SUPABASE_SERVICE_ROLE_KEY:
                critical_missing.append("SUPABASE_SERVICE_ROLE_KEY")
            if not self.RAZORPAY_KEY_SECRET or "placeholder" in self.RAZORPAY_KEY_SECRET:
                critical_missing.append("RAZORPAY_KEY_SECRET")
            if not self.GROQ_API_KEY or "placeholder" in self.GROQ_API_KEY:
                critical_missing.append("GROQ_API_KEY")

            if critical_missing:
                raise ValueError(
                    f"PRODUCTION HARDENING FAIL-FAST: Missing or placeholder credentials detected for: {', '.join(critical_missing)}"
                )

        return self


settings = Settings()

