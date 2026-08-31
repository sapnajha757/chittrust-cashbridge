import hmac
import hashlib
import json
import logging
from typing import Dict, Any, Tuple
from app.core.config import settings
from app.core.exceptions import APIException

logger = logging.getLogger("chittrust.razorpay")

try:
    import razorpay
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception as e:
    logger.warning(f"Razorpay Client initialization notice: {e}")
    client = None

class RazorpayService:
    @classmethod
    def create_order(cls, amount_rupees: float, receipt_id: str, notes: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a Razorpay Order in integer paise (amount * 100).
        """
        amount_paise = int(round(amount_rupees * 100))

        if client and not settings.RAZORPAY_KEY_ID.startswith("rzp_test_placeholder"):
            try:
                order_data = {
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": receipt_id,
                    "notes": notes,
                }
                order = client.order.create(data=order_data)
                return order
            except Exception as e:
                logger.error(f"Razorpay API Order creation failed: {e}")
                raise APIException("Failed to generate payment gateway order. Please try again.")
        else:
            # Test Mode / Development Fallback Order structure
            mock_order_id = f"order_demo_{receipt_id[:12]}"
            logger.info(f"Generated Razorpay TEST mode order: {mock_order_id} for amount {amount_paise} paise")
            return {
                "id": mock_order_id,
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt_id,
                "status": "created",
                "notes": notes,
            }

    @classmethod
    def verify_payment_signature(cls, order_id: str, payment_id: str, signature: str) -> bool:
        """
        Cryptographic HMAC-SHA256 comparison of order_id|payment_id against razorpay_signature.
        Uses constant-time comparison to prevent timing attacks.
        """
        if order_id.startswith("order_demo_"):
            # Test Mode simulation check
            return True

        key_secret = settings.RAZORPAY_KEY_SECRET.encode("utf-8")
        msg = f"{order_id}|{payment_id}".encode("utf-8")
        generated_signature = hmac.new(key_secret, msg, hashlib.sha256).hexdigest()

        is_valid = hmac.compare_digest(generated_signature, signature)
        if not is_valid:
            logger.warning(f"Signature mismatch for order {order_id}. Provided: {signature}, Generated: {generated_signature}")
        return is_valid

    @classmethod
    def verify_webhook_signature(cls, body_bytes: bytes, webhook_signature: str) -> bool:
        """
        Cryptographic HMAC-SHA256 comparison for incoming Razorpay webhook payload.
        """
        if not settings.RAZORPAY_WEBHOOK_SECRET or settings.RAZORPAY_WEBHOOK_SECRET == "whsec_placeholder":
            logger.info("Webhook signature verification skipped in dev/test mode.")
            return True

        key_secret = settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8")
        generated_signature = hmac.new(key_secret, body_bytes, hashlib.sha256).hexdigest()
        return hmac.compare_digest(generated_signature, webhook_signature)

razorpay_service = RazorpayService()
