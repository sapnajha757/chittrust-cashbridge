from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from typing import Dict, Any
from app.core.config import settings
from app.db.supabase import get_supabase_client

router = APIRouter()

class InfrastructureHealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    infrastructure: Dict[str, Any]

@router.get("/health", tags=["Health"])
async def get_health(response: Response):
    """
    Real infrastructure health check endpoint.
    Reports connectivity and configuration status for Supabase PostgreSQL,
    Razorpay, Groq AI, Twilio Voice, and Supabase Storage without exposing secrets.
    """
    # 1. Database Check
    db_status = "unhealthy"
    client = get_supabase_client()
    if client:
        try:
            res = client.table("profiles").select("id").limit(1).execute()
            db_status = "connected"
        except Exception:
            db_status = "error"
    else:
        db_status = "unconfigured"

    # 2. Razorpay Check
    rzp_configured = bool(
        settings.RAZORPAY_KEY_ID 
        and "placeholder" not in settings.RAZORPAY_KEY_ID 
        and settings.RAZORPAY_KEY_SECRET 
        and "placeholder" not in settings.RAZORPAY_KEY_SECRET
    )
    rzp_status = "configured" if rzp_configured else "unconfigured"

    # 3. Groq AI Check
    groq_configured = bool(
        settings.GROQ_API_KEY 
        and "placeholder" not in settings.GROQ_API_KEY
    )
    groq_status = "configured" if groq_configured else "unconfigured"

    # 4. Twilio Telephony Check
    twilio_configured = bool(
        settings.TWILIO_ACCOUNT_SID 
        and settings.TWILIO_AUTH_TOKEN 
        and settings.TWILIO_PHONE_NUMBER
    )
    twilio_status = "configured" if twilio_configured else "unconfigured"

    # 5. Persistent Storage Check
    storage_status = "connected" if client else "unconfigured"

    overall_status = "healthy"
    if db_status in ["unhealthy", "error", "unconfigured"]:
        overall_status = "degraded"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": overall_status,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "infrastructure": {
            "database": db_status,
            "razorpay": rzp_status,
            "groq_ai": groq_status,
            "twilio_voice": twilio_status,
            "storage": storage_status,
        }
    }

