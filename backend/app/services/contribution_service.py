import uuid
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.razorpay_service import razorpay_service
from app.core.config import settings

logger = logging.getLogger("chittrust.contributions")

# Local demo storage for testing payment state transitions
DEMO_CONTRIBUTIONS: List[Dict[str, Any]] = [
    {
        "id": "c1111111-1111-1111-1111-111111111111",
        "membership_id": "22222222-2222-2222-2222-222222222222",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "month_number": 1,
        "amount": 2500.0,
        "mode": "upi",
        "confirmed_via": "app",
        "payment_status": "successful",
        "paid_on_time": True,
        "payment_date": (datetime.utcnow() - timedelta(days=15)).isoformat(),
        "razorpay_order_id": "order_demo_111111",
        "razorpay_payment_id": "pay_demo_987654",
        "transaction_reference": "UPI/2026/089123",
        "created_at": (datetime.utcnow() - timedelta(days=15)).isoformat(),
    }
]

DEMO_WEBHOOK_EVENTS: set = set()

class ContributionService:
    @staticmethod
    def calculate_payment_timeliness(group_start_date: datetime, month_number: int, payment_date: datetime) -> bool:
        """
        MVP Rule: Month 1 is due on group start date; Month N is due (N-1) months after group start date.
        Grants a 5-day grace period for on-time credit qualification.
        """
        due_date = group_start_date + timedelta(days=30 * (month_number - 1))
        grace_period_end = due_date + timedelta(days=5)
        return payment_date <= grace_period_end

    @classmethod
    def create_upi_order(cls, membership_id: str, requested_month: Optional[int] = None) -> Dict[str, Any]:
        month_number = requested_month or 2 # Default to month 2 for demo

        # Check for existing successful payment
        existing_paid = next(
            (c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["month_number"] == month_number and c["payment_status"] == "successful"),
            None
        )
        if existing_paid:
            raise APIException("This month's contribution has already been paid.")

        # Server-side fixed contribution amount (never trust client)
        server_amount_rupees = 2500.0
        receipt_id = f"rcpt_m{month_number}_{membership_id[:8]}"

        notes = {
            "membership_id": membership_id,
            "month_number": month_number,
            "system": "ChitTrust"
        }

        # Create Razorpay order
        order = razorpay_service.create_order(server_amount_rupees, receipt_id, notes)

        # Upsert pending contribution record
        pending_contrib = next(
            (c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["month_number"] == month_number and c["payment_status"] == "pending"),
            None
        )

        now_str = datetime.utcnow().isoformat()
        if not pending_contrib:
            pending_contrib = {
                "id": str(uuid.uuid4()),
                "membership_id": membership_id,
                "group_id": "11111111-1111-1111-1111-111111111111",
                "month_number": month_number,
                "amount": server_amount_rupees,
                "mode": "upi",
                "confirmed_via": "app",
                "payment_status": "pending",
                "paid_on_time": False,
                "payment_date": None,
                "razorpay_order_id": order["id"],
                "razorpay_payment_id": None,
                "transaction_reference": None,
                "created_at": now_str,
            }
            DEMO_CONTRIBUTIONS.append(pending_contrib)
        else:
            pending_contrib["razorpay_order_id"] = order["id"]

        return {
            "order_id": order["id"],
            "amount_paise": order["amount"],
            "amount_rupees": server_amount_rupees,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "membership_id": membership_id,
            "month_number": month_number,
            "notes": notes,
        }

    @classmethod
    def verify_upi_payment(cls, membership_id: str, month_number: int, order_id: str, payment_id: str, signature: str) -> Dict[str, Any]:
        # Cryptographic HMAC signature check
        is_valid = razorpay_service.verify_payment_signature(order_id, payment_id, signature)
        if not is_valid:
            logger.warning(f"Payment signature verification failed for membership {membership_id}")
            raise APIException("Invalid payment signature. Verification failed.", status_code=400)

        contrib = next(
            (c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["month_number"] == month_number),
            None
        )

        now = datetime.utcnow()
        now_str = now.isoformat()

        if not contrib:
            contrib = {
                "id": str(uuid.uuid4()),
                "membership_id": membership_id,
                "group_id": "11111111-1111-1111-1111-111111111111",
                "month_number": month_number,
                "amount": 2500.0,
                "mode": "upi",
                "confirmed_via": "app",
                "payment_status": "successful",
                "paid_on_time": True,
                "payment_date": now_str,
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "transaction_reference": payment_id,
                "created_at": now_str,
            }
            DEMO_CONTRIBUTIONS.append(contrib)
        else:
            contrib["payment_status"] = "successful"
            contrib["payment_date"] = now_str
            contrib["razorpay_order_id"] = order_id
            contrib["razorpay_payment_id"] = payment_id
            contrib["transaction_reference"] = payment_id
            contrib["paid_on_time"] = True

        logger.info(f"Payment verified successfully for membership {membership_id}, month {month_number}")
        return contrib

    @classmethod
    def process_webhook(cls, event_id: str, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        # Idempotency check
        if event_id in DEMO_WEBHOOK_EVENTS:
            logger.info(f"Webhook event {event_id} already processed. Skipping.")
            return {"status": "already_processed", "event_id": event_id}

        DEMO_WEBHOOK_EVENTS.add(event_id)

        if event_type in ["payment.authorized", "payment.captured"]:
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")

            if order_id:
                contrib = next((c for c in DEMO_CONTRIBUTIONS if c.get("razorpay_order_id") == order_id), None)
                if contrib:
                    contrib["payment_status"] = "successful"
                    contrib["payment_date"] = datetime.utcnow().isoformat()
                    contrib["razorpay_payment_id"] = payment_id
                    contrib["transaction_reference"] = payment_id
                    contrib["paid_on_time"] = True
                    logger.info(f"Webhook updated contribution {contrib['id']} to successful.")

        return {"status": "success", "event_id": event_id}

contribution_service = ContributionService()
