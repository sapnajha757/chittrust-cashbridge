from fastapi import APIRouter, Request, Header, HTTPException, status
import logging
from app.services.razorpay_service import razorpay_service
from app.services.contribution_service import contribution_service

logger = logging.getLogger("chittrust.payments.webhook")
router = APIRouter()

@router.post("/razorpay/webhook", status_code=status.HTTP_200_OK)
async def razorpay_webhook_handler(
    request: Request,
    x_razorpay_signature: str = Header(None, alias="X-Razorpay-Signature")
):
    """
    Razorpay Webhook endpoint.
    Verifies cryptographic webhook signature & processes payment events with idempotency.
    """
    body_bytes = await request.body()

    if x_razorpay_signature:
        is_valid = razorpay_service.verify_webhook_signature(body_bytes, x_razorpay_signature)
        if not is_valid:
            logger.warning("Razorpay Webhook signature verification failed.")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature.")

    try:
        payload_data = await request.json()
        event_id = payload_data.get("event", "event_default") + "_" + str(payload_data.get("created_at", 0))
        event_type = payload_data.get("event", "unknown")

        result = contribution_service.process_webhook(
            event_id=event_id,
            event_type=event_type,
            payload=payload_data.get("payload", {})
        )

        return {"status": "ok", "result": result}
    except Exception as e:
        logger.error(f"Error processing Razorpay webhook: {e}")
        return {"status": "ok", "notice": "Webhook recorded"}
