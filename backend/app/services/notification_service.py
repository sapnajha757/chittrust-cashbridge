import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.notifications")

DEMO_NOTIFICATIONS: List[Dict[str, Any]] = [
    {
        "id": "n1111111-1111-1111-1111-111111111111",
        "user_id": "00000000-0000-0000-0000-000000000004",
        "type": "cash_receipt",
        "title": "Cash Payment Recorded ✓",
        "message": "₹2,500 cash payment received for Month 1. Recorded by CashBridge Agent Suresh Patel.",
        "related_entity_id": "c3333333-3333-3333-3333-333333333333",
        "read": False,
        "created_at": datetime.utcnow().isoformat(),
    }
]

class NotificationService:
    @classmethod
    def send_notification(
        cls,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "cash_receipt",
        related_entity_id: Optional[str] = None
    ) -> Dict[str, Any]:
        noti_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        record = {
            "id": noti_id,
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "related_entity_id": related_entity_id,
            "read": False,
            "created_at": now,
        }

        client = get_supabase_client()
        if client:
            try:
                db_record = {
                    "id": noti_id,
                    "user_id": user_id,
                    "type": notification_type,
                    "title": title,
                    "message": message,
                    "channel": "in_app",
                    "status": "sent",
                    "created_at": now,
                }
                client.table("notifications").insert(db_record).execute()
            except Exception as err:
                logger.warning(f"DB notification insert error: {err}")

        DEMO_NOTIFICATIONS.append(record)
        logger.info(f"Notification issued to user {user_id}: {title}")
        return record

    @classmethod
    def list_user_notifications(cls, user_id: str) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as err:
                logger.warning(f"DB list_user_notifications error: {err}")

        return [n for n in DEMO_NOTIFICATIONS if n["user_id"] == user_id]

    @classmethod
    def mark_as_read(cls, notification_id: str, user_id: str) -> Dict[str, Any]:
        client = get_supabase_client()
        now = datetime.utcnow().isoformat()

        if client:
            try:
                client.table("notifications").update({"read_at": now, "status": "read"}).eq("id", notification_id).execute()
            except Exception as err:
                logger.warning(f"DB mark_as_read error: {err}")

        noti = next((n for n in DEMO_NOTIFICATIONS if n["id"] == notification_id and n["user_id"] == user_id), None)
        if noti:
            noti["read"] = True
        return {"id": notification_id, "read": True, "message": "Notification marked as read."}

notification_service = NotificationService()
