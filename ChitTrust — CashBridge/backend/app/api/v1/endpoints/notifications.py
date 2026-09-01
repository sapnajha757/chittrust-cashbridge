from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.schemas.notification import NotificationResponse, NotificationReadResponse
from app.services.notification_service import notification_service
from app.auth.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists in-app notifications for the authenticated user.
    """
    user_id = current_user["id"]
    return notification_service.list_user_notifications(user_id)

@router.patch("/{notification_id}/read", response_model=NotificationReadResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Marks an in-app notification as read.
    """
    user_id = current_user["id"]
    return notification_service.mark_as_read(notification_id, user_id)

@router.post("/read-all")
async def mark_all_notifications_read(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Marks all notifications as read for the authenticated user.
    """
    user_id = current_user["id"]
    notifications = notification_service.list_user_notifications(user_id)
    for n in notifications:
        n["read"] = True
    return {"message": "All notifications marked as read."}
