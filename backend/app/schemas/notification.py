from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    related_entity_id: Optional[str] = None
    read: bool
    created_at: datetime

class NotificationReadResponse(BaseModel):
    id: str
    read: bool
    message: str = "Notification marked as read."
