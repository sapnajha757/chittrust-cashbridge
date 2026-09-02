import hmac
import hashlib
import json
import logging
from typing import Dict, Any, Tuple
from app.core.config import settings
from app.core.exceptions import APIException

logger = logging.getLogger("chittrust.razorpay")

def _get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID or "placeholder" in settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET or "placeholder" in settings.RAZORPAY_KEY_SECRET:
        return None
    try:
        import razorpay
        return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    except Exception as e:
        logger.warning(f"Razorpay Client initialization error: {e}")
        return None

class RazorpayService:
    @classmethod
    def create_order(cls, amount_rupees: float, receipt_id: str, notes: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a Razorpay Order in integer paise (amount * 100).
        Fails loudly if Razorpay credentials are missing or API call fails.
        """
        amount_paise = int(round(amount_rupees * 100))
        rzp_client = _get_razorpay_client()

        if not rzp_client:
            logger.error("Razorpay integration credentials missing or invalid.")
            raise APIException("Payment service unavailable: Razorpay credentials unconfigured.", status_code=500)

        try:
            order_data = {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt_id,
                "notes": notes,
            }
            order = rzp_client.order.create(data=order_data)
            return order
        except APIException:
            raise
        except Exception as e:
            logger.error(f"Razorpay API Order creation failed: {e}")
            raise APIException(f"Failed to generate payment gateway order: {str(e)}", status_code=500)

    @classmethod
    def verify_payment_signature(cls, order_id: str, payment_id: str, signature: str) -> bool:
        """
        Cryptographic HMAC-SHA256 comparison of order_id|payment_id against razorpay_signature.
        Uses constant-time comparison to prevent timing attacks.
        """
        if not settings.RAZORPAY_KEY_SECRET or "placeholder" in settings.RAZORPAY_KEY_SECRET:
            logger.error("RAZORPAY_KEY_SECRET is unconfigured.")
            return False

        if not order_id or not payment_id or not signature:
            return False

        try:
            key_secret = settings.RAZORPAY_KEY_SECRET.encode("utf-8")
            msg = f"{order_id}|{payment_id}".encode("utf-8")
            generated_signature = hmac.new(key_secret, msg, hashlib.sha256).hexdigest()
            is_valid = hmac.compare_digest(generated_signature, signature)
            if not is_valid:
                logger.warning(f"Signature mismatch for order {order_id}. Provided: {signature}")
            return is_valid
        except Exception as err:
            logger.error(f"Payment signature verification exception: {err}")
            return False

    @classmethod
    def verify_webhook_signature(cls, body_bytes: bytes, webhook_signature: str) -> bool:
        """
        Cryptographic HMAC-SHA256 comparison for incoming Razorpay webhook payload.
        Uses constant-time comparison (hmac.compare_digest) to prevent timing attacks.
        """
        if not settings.RAZORPAY_WEBHOOK_SECRET or "placeholder" in settings.RAZORPAY_WEBHOOK_SECRET:
            logger.error("RAZORPAY_WEBHOOK_SECRET is unconfigured.")
            return False

        if not webhook_signature or not body_bytes:
            logger.warning("Missing webhook signature header or payload bytes.")
            return False

        try:
            key_secret = settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8")
            generated_signature = hmac.new(key_secret, body_bytes, hashlib.sha256).hexdigest()
            return hmac.compare_digest(generated_signature, webhook_signature)
        except Exception as e:
            logger.error(f"Error during webhook signature verification: {e}")
            return False

razorpay_service = RazorpayService()


