import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

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
    def send_notification(cls, user_id: str, title: str, message: str, notification_type: str = "cash_receipt", related_entity_id: Optional[str] = None) -> Dict[str, Any]:
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
        DEMO_NOTIFICATIONS.append(record)
        logger.info(f"Notification issued to user {user_id}: {title}")
        return record

    @classmethod
    def list_user_notifications(cls, user_id: str) -> List[Dict[str, Any]]:
        return [n for n in DEMO_NOTIFICATIONS if n["user_id"] == user_id]

    @classmethod
    def mark_as_read(cls, notification_id: str, user_id: str) -> Dict[str, Any]:
        noti = next((n for n in DEMO_NOTIFICATIONS if n["id"] == notification_id and n["user_id"] == user_id), None)
        if noti:
            noti["read"] = True
        return {"id": notification_id, "read": True, "message": "Notification marked as read."}

notification_service = NotificationService()
