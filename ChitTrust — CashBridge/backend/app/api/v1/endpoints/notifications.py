from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.notification import NotificationResponse, NotificationReadResponse
from app.services.notification_service import notification_service

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
async def list_notifications():
    """
    Lists in-app notifications for the authenticated user.
    """
    user_id = "00000000-0000-0000-0000-000000000004"
    return notification_service.list_user_notifications(user_id)

@router.patch("/{notification_id}/read", response_model=NotificationReadResponse)
async def mark_notification_read(notification_id: str):
    """
    Marks an in-app notification as read.
    """
    user_id = "00000000-0000-0000-0000-000000000004"
    return notification_service.mark_as_read(notification_id, user_id)

@router.post("/read-all")
async def mark_all_notifications_read():
    """
    Marks all notifications as read for the authenticated user.
    """
    user_id = "00000000-0000-0000-0000-000000000004"
    notifications = notification_service.list_user_notifications(user_id)
    for n in notifications:
        n["read"] = True
    return {"message": "All notifications marked as read."}
