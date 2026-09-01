from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from app.schemas.group import (
    GroupCreate,
    GroupUpdate,
    GroupResponse,
    MemberAddRequest,
    MembershipResponse,
)
from app.services.group_service import group_service
from app.auth.deps import get_current_user, require_organizer
from app.core.exceptions import APIException

router = APIRouter()

@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    data: GroupCreate,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Creates a new community chit fund group (Organizers only).
    Identity is derived strictly from JWT.
    """
    organizer_id = current_user["id"]
    return group_service.create_group(organizer_id, data)

@router.get("", response_model=List[GroupResponse])
async def list_groups(
    role: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists groups relevant to the current authenticated user.
    """
    user_id = current_user.get("id")
    user_role = current_user.get("user_type") or role
    organizer_id = user_id if user_role == "organizer" else None
    return group_service.list_groups(organizer_id=organizer_id)

@router.get("/{group_id}", response_model=GroupResponse)
async def get_group_details(
    group_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves details for a specific chit group.
    """
    return group_service.get_group_by_id(group_id)

@router.patch("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: str,
    data: GroupUpdate,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Updates configuration for an active group.
    """
    organizer_id = current_user["id"]
    user_role = current_user.get("user_type", "organizer")
    return group_service.update_group(group_id, data, organizer_id, user_role=user_role)

@router.post("/{group_id}/pause", response_model=GroupResponse)
async def pause_group(
    group_id: str,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Pauses activity for a group.
    """
    organizer_id = current_user["id"]
    user_role = current_user.get("user_type", "organizer")
    return group_service.update_group(group_id, GroupUpdate(status="paused"), organizer_id, user_role=user_role)

@router.post("/{group_id}/close", response_model=GroupResponse)
async def close_group(
    group_id: str,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Closes a group permanently.
    """
    organizer_id = current_user["id"]
    user_role = current_user.get("user_type", "organizer")
    return group_service.update_group(group_id, GroupUpdate(status="closed"), organizer_id, user_role=user_role)

@router.get("/{group_id}/members", response_model=List[MembershipResponse])
async def list_group_members(
    group_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists all members for a specific group.
    """
    return group_service.list_members(group_id)

@router.post("/{group_id}/members", status_code=status.HTTP_201_CREATED)
async def add_member(
    group_id: str,
    req: MemberAddRequest,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Adds a digital/cash member to a group.
    """
    organizer_id = current_user["id"]
    user_role = current_user.get("user_type", "organizer")
    new_mem = group_service.add_member(group_id, req, organizer_id, user_role=user_role)
    return {
        "message": "Member added successfully.",
        "membership": new_mem,
    }

@router.post("/memberships/{membership_id}/exit")
async def exit_membership(
    membership_id: str,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Exits a member from a group while preserving historical financial records.
    """
    organizer_id = current_user["id"]
    user_role = current_user.get("user_type", "organizer")
    return group_service.exit_member(membership_id, organizer_id, user_role=user_role)
