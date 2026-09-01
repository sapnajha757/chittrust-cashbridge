import pytest
import hmac
import hashlib
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import Settings
from app.core.logging import SensitiveDataFilter, setup_logging
import logging

client = TestClient(app)

def test_production_fail_fast_validation():
    """
    Verifies that setting ENVIRONMENT='production' fails fast when critical credentials are missing or placeholders.
    """
    with pytest.raises(ValueError) as exc_info:
        Settings(
            ENVIRONMENT="production",
            DEMO_MODE=True,
            SUPABASE_URL="https://placeholder.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY="placeholder_key",
            RAZORPAY_KEY_SECRET="placeholder_secret",
            GROQ_API_KEY=""
        )
    assert "PRODUCTION HARDENING FAIL-FAST" in str(exc_info.value)


def test_production_cors_wildcard_rejection():
    """
    Verifies that wildcard CORS origin '*' is prohibited in production.
    """
    with pytest.raises(ValueError) as exc_info:
        Settings(
            ENVIRONMENT="production",
            CORS_ORIGINS=["*"],
            SUPABASE_URL="https://valid.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY="real_role_key_123",
            RAZORPAY_KEY_SECRET="real_secret_456",
            GROQ_API_KEY="gsk_real_key_789"
        )
    assert "Insecure CORS wildcard" in str(exc_info.value)


def test_security_headers_present():
    """
    Verifies that essential security headers are returned on API endpoints.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "DENY"
    assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert "permissions-policy" in response.headers


def test_sensitive_log_data_sanitization():
    """
    Verifies that SensitiveDataFilter masks Bearer tokens, API keys, and secrets in logs.
    """
    filter_inst = SensitiveDataFilter()

    # Test Bearer JWT masking
    record_jwt = logging.LogRecord("test", logging.INFO, "", 0, "Auth token Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig", (), None)
    filter_inst.filter(record_jwt)
    assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in record_jwt.msg
    assert "[REDACTED_JWT]" in record_jwt.msg

    # Test Groq key masking
    record_groq = logging.LogRecord("test", logging.INFO, "", 0, "Using Groq API Key gsk_wMEM6BLjcVHLS4d43L0rWG", (), None)
    filter_inst.filter(record_groq)
    assert "gsk_wMEM6BLjcVHLS4d43L0rWG" not in record_groq.msg
    assert "[REDACTED_GROQ_KEY]" in record_groq.msg


def test_voice_telephony_unknown_caller_privacy():
    """
    Verifies that an unknown phone caller is denied access to private financial data over voice IVR.
    """
    payload = {
        "From": "+919876543210", # Unknown caller
        "Digits": "2"
    }
    response = client.post("/api/v1/voice/input", data=payload)
    assert response.status_code == 200
    # Expected TwiML/speech response denying access to unregistered caller
    assert "registered nahi hai" in response.text or "not registered" in response.text


def test_voice_telephony_authenticated_caller_privacy():
    """
    Verifies that a known registered caller phone accesses their own trust score over voice IVR.
    """
    payload = {
        "From": "+919900000003", # Registered Demo Member Priya
        "Digits": "2"
    }
    response = client.post("/api/v1/voice/input", data=payload)
    assert response.status_code == 200
    assert "Trust Score" in response.text or "score" in response.text


def test_razorpay_webhook_idempotency_and_signature():
    """
    Verifies Razorpay webhook idempotency and signature verification checks.
    """
    secret = "whsec_chittrust_test_secret"
    body_payload = '{"id":"evt_test_12345","event":"payment.captured","created_at":1700000000,"payload":{"payment":{"entity":{"id":"pay_test_999","order_id":"order_demo_111111"}}}}'
    
    # Compute signature
    sig = hmac.new(secret.encode("utf-8"), body_payload.encode("utf-8"), hashlib.sha256).hexdigest()

    # First request
    resp1 = client.post(
        "/api/v1/payments/razorpay/webhook",
        content=body_payload,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig}
    )
    assert resp1.status_code == 200

    # Second duplicate request (Same event_id)
    resp2 = client.post(
        "/api/v1/payments/razorpay/webhook",
        content=body_payload,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig}
    )
    assert resp2.status_code == 200
    assert resp2.json().get("result", {}).get("status") == "already_processed"
