import uuid
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.razorpay_service import razorpay_service
from app.core.config import settings

from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.contributions")

import uuid
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.razorpay_service import razorpay_service
from app.core.config import settings
from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.contributions")

# In-memory storage retained purely for isolated unit test mocking compatibility
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
        due_date = group_start_date + timedelta(days=30 * (month_number - 1))
        grace_period_end = due_date + timedelta(days=5)
        return payment_date <= grace_period_end

    @classmethod
    def create_upi_order(cls, membership_id: str, requested_month: Optional[int] = None) -> Dict[str, Any]:
        month_number = requested_month or 2
        client = get_supabase_client()

        # Check existing paid contributions
        if client:
            try:
                res = client.table("contributions").select("*").eq("membership_id", membership_id).eq("month_number", month_number).eq("payment_status", "successful").execute()
                if res.data and len(res.data) > 0:
                    raise APIException("This month's contribution has already been paid.", status_code=400)
            except APIException:
                raise
            except Exception as e:
                logger.error(f"Failed querying existing contribution from DB: {e}")
        else:
            existing_paid = next(
                (c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["month_number"] == month_number and c["payment_status"] == "successful"),
                None
            )
            if existing_paid:
                raise APIException("This month's contribution has already been paid.", status_code=400)

        server_amount_rupees = 2500.0
        receipt_id = f"rcpt_m{month_number}_{membership_id[:8]}"
        notes = {
            "membership_id": membership_id,
            "month_number": month_number,
            "system": "ChitTrust"
        }

        order = razorpay_service.create_order(server_amount_rupees, receipt_id, notes)
        now_str = datetime.utcnow().isoformat()

        if client:
            try:
                contrib_record = {
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
                client.table("contributions").insert(contrib_record).execute()
            except Exception as e:
                logger.error(f"Failed persisting pending contribution to Supabase DB: {e}")
        else:
            pending_contrib = next(
                (c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["month_number"] == month_number and c["payment_status"] == "pending"),
                None
            )
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
            "amount_paise": order.get("amount", int(server_amount_rupees * 100)),
            "amount_rupees": server_amount_rupees,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "membership_id": membership_id,
            "month_number": month_number,
            "notes": notes,
        }

    @classmethod
    def verify_upi_payment(cls, membership_id: str, month_number: int, order_id: str, payment_id: str, signature: str) -> Dict[str, Any]:
        is_valid = razorpay_service.verify_payment_signature(order_id, payment_id, signature)
        if not is_valid:
            logger.warning(f"Payment signature verification failed for membership {membership_id}")
            raise APIException("Invalid payment signature. Verification failed.", status_code=400)

        client = get_supabase_client()
        now_str = datetime.utcnow().isoformat()
        updated_contrib = None

        if client:
            try:
                res = client.table("contributions").select("*").eq("membership_id", membership_id).eq("month_number", month_number).execute()
                if res.data and len(res.data) > 0:
                    c_id = res.data[0]["id"]
                    client.table("contributions").update({
                        "payment_status": "successful",
                        "payment_date": now_str,
                        "razorpay_order_id": order_id,
                        "razorpay_payment_id": payment_id,
                        "transaction_reference": payment_id,
                        "paid_on_time": True
                    }).eq("id", c_id).execute()
                    updated_contrib = res.data[0]
                    updated_contrib.update({
                        "payment_status": "successful",
                        "payment_date": now_str,
                        "razorpay_order_id": order_id,
                        "razorpay_payment_id": payment_id,
                        "transaction_reference": payment_id,
                        "paid_on_time": True
                    })
                else:
                    new_rec = {
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
                    client.table("contributions").insert(new_rec).execute()
                    updated_contrib = new_rec
            except Exception as err:
                logger.error(f"Supabase update error on payment verification: {err}")

        if not updated_contrib:
            contrib = next(
                (c for c in DEMO_CONTRIBUTIONS if c["membership_id"] == membership_id and c["month_number"] == month_number),
                None
            )
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
            updated_contrib = contrib

        logger.info(f"Payment verified successfully for membership {membership_id}, month {month_number}")
        return updated_contrib

    @classmethod
    def process_webhook(cls, event_id: str, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        client = get_supabase_client()

        if client:
            try:
                evt_check = client.table("audit_logs").select("*").eq("action", "RAZORPAY_WEBHOOK").eq("details->>event_id", event_id).execute()
                if evt_check.data and len(evt_check.data) > 0:
                    logger.info(f"Webhook event {event_id} already processed in DB. Skipping.")
                    return {"status": "already_processed", "event_id": event_id}
            except Exception as e:
                logger.warning(f"Failed idempotency query on DB: {e}")

        if event_id in DEMO_WEBHOOK_EVENTS:
            logger.info(f"Webhook event {event_id} already processed. Skipping duplicate execution.")
            return {"status": "already_processed", "event_id": event_id}

        DEMO_WEBHOOK_EVENTS.add(event_id)

        payment_entity = payload.get("payment", {}).get("entity", {}) if isinstance(payload.get("payment"), dict) else payload.get("entity", {})
        order_id = payment_entity.get("order_id") or payment_entity.get("id_or_order")
        payment_id = payment_entity.get("id")
        now_iso = datetime.utcnow().isoformat()

        if event_type in ["payment.captured", "payment.authorized"]:
            status_label = "successful" if event_type == "payment.captured" else "authorized"
            if order_id and client:
                try:
                    client.table("contributions").update({
                        "payment_status": status_label,
                        "payment_date": now_iso,
                        "razorpay_payment_id": payment_id,
                        "transaction_reference": payment_id,
                        "paid_on_time": True
                    }).eq("razorpay_order_id", order_id).execute()
                except Exception as err:
                    logger.error(f"Failed updating contribution on webhook: {err}")

            if order_id:
                contrib = next((c for c in DEMO_CONTRIBUTIONS if c.get("razorpay_order_id") == order_id), None)
                if contrib:
                    contrib["payment_status"] = status_label
                    contrib["payment_date"] = now_iso
                    contrib["razorpay_payment_id"] = payment_id
                    contrib["transaction_reference"] = payment_id
                    contrib["paid_on_time"] = True

        elif event_type == "payment.failed":
            if order_id and client:
                try:
                    client.table("contributions").update({"payment_status": "failed"}).eq("razorpay_order_id", order_id).execute()
                except Exception as err:
                    logger.error(f"Failed updating contribution on webhook failure: {err}")

            if order_id:
                contrib = next((c for c in DEMO_CONTRIBUTIONS if c.get("razorpay_order_id") == order_id), None)
                if contrib:
                    contrib["payment_status"] = "failed"

        if client:
            try:
                client.table("audit_logs").insert({
                    "action": "RAZORPAY_WEBHOOK",
                    "details": {"event_id": event_id, "event_type": event_type, "order_id": order_id, "payment_id": payment_id},
                    "created_at": now_iso
                }).execute()
            except Exception as err:
                logger.warning(f"Could not persist webhook audit log to DB: {err}")

        return {"status": "success", "event_id": event_id, "event_type": event_type}

contribution_service = ContributionService()

