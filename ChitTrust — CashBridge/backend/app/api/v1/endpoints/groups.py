from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
import uuid

from app.schemas.group import (
    GroupCreate,
    GroupUpdate,
    GroupResponse,
    MemberAddRequest,
    MembershipResponse,
    InvitationResponse,
)
from app.services.group_service import group_service
from app.core.exceptions import APIException

router = APIRouter()

# Demo storage for local hackathon testing
DEMO_GROUPS = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Ganesh Traders Community Chit #1",
        "total_amount": 30000.0,
        "duration_months": 12,
        "contribution_per_month": 2500.0,
        "auction_type": "bid",
        "organizer_id": "00000000-0000-0000-0000-000000000001",
        "status": "active",
        "member_count": 2,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
]

DEMO_MEMBERSHIPS = [
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "user_id": "00000000-0000-0000-0000-000000000003",
        "member_name": "Demo Digital Member Priya",
        "phone_number": "+919900000003",
        "member_type": "digital",
        "agent_id": None,
        "agent_name": None,
        "status": "active",
        "joined_at": datetime.utcnow().isoformat(),
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "user_id": "00000000-0000-0000-0000-000000000004",
        "member_name": "Demo Cash Member Anil",
        "phone_number": "+919900000004",
        "member_type": "cash",
        "agent_id": "00000000-0000-0000-0000-000000000002",
        "agent_name": "Demo CashBridge Agent Suresh",
        "status": "active",
        "joined_at": datetime.utcnow().isoformat(),
    },
]

DEMO_INVITATIONS = []


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(data: GroupCreate):
    """
    Creates a new community chit fund group. (Organizers only)
    """
    organizer_id = "00000000-0000-0000-0000-000000000001"  # Derived from auth session in production
    new_group = group_service.create_group(organizer_id, data)
    DEMO_GROUPS.append(new_group)
    return new_group


@router.get("", response_model=List[GroupResponse])
async def list_groups(role: Optional[str] = None):
    """
    Lists groups relevant to the current user role.
    """
    return DEMO_GROUPS


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group_details(group_id: str):
    """
    Retrieves details for a specific chit group.
    """
    group = next((g for g in DEMO_GROUPS if g["id"] == group_id), None)
    if not group:
        raise APIException("Group not found.", status_code=status.HTTP_404_NOT_FOUND)
    return group


@router.patch("/{group_id}", response_model=GroupResponse)
async def update_group(group_id: str, data: GroupUpdate):
    """
    Updates configuration for an active group.
    """
    group = next((g for g in DEMO_GROUPS if g["id"] == group_id), None)
    if not group:
        raise APIException("Group not found.", status_code=status.HTTP_404_NOT_FOUND)

    if data.name:
        group["name"] = data.name.strip()
    if data.auction_type:
        group["auction_type"] = data.auction_type
    if data.status:
        group["status"] = data.status
    group["updated_at"] = datetime.utcnow().isoformat()
    return group


@router.post("/{group_id}/pause", response_model=GroupResponse)
async def pause_group(group_id: str):
    """
    Pauses activity for a group.
    """
    group = next((g for g in DEMO_GROUPS if g["id"] == group_id), None)
    if not group:
        raise APIException("Group not found.", status_code=status.HTTP_404_NOT_FOUND)
    group["status"] = "paused"
    group["updated_at"] = datetime.utcnow().isoformat()
    return group


@router.post("/{group_id}/close", response_model=GroupResponse)
async def close_group(group_id: str):
    """
    Closes a group permanently.
    """
    group = next((g for g in DEMO_GROUPS if g["id"] == group_id), None)
    if not group:
        raise APIException("Group not found.", status_code=status.HTTP_404_NOT_FOUND)
    group["status"] = "closed"
    group["updated_at"] = datetime.utcnow().isoformat()
    return group


@router.get("/{group_id}/members", response_model=List[MembershipResponse])
async def list_group_members(group_id: str):
    """
    Lists all members and pending invitations for a specific group.
    """
    return [m for m in DEMO_MEMBERSHIPS if m["group_id"] == group_id]


@router.post("/{group_id}/members", status_code=status.HTTP_201_CREATED)
async def add_member(group_id: str, req: MemberAddRequest):
    """
    Adds a digital/cash member to a group or creates an invitation.
    """
    group = next((g for g in DEMO_GROUPS if g["id"] == group_id), None)
    if not group:
        raise APIException("Group not found.", status_code=status.HTTP_404_NOT_FOUND)

    norm_phone = group_service.normalize_phone(req.phone_number)

    # Check for duplicate active membership
    existing_mem = next(
        (m for m in DEMO_MEMBERSHIPS if m["group_id"] == group_id and m["phone_number"] == norm_phone and m["status"] == "active"),
        None,
    )
    if existing_mem:
        raise APIException("This user is already an active member of this group.")

    # Create new membership
    new_mem_id = str(uuid.uuid4())
    new_mem = {
        "id": new_mem_id,
        "group_id": group_id,
        "user_id": str(uuid.uuid4()),
        "member_name": req.name.strip(),
        "phone_number": norm_phone,
        "member_type": req.member_type,
        "agent_id": req.agent_id if req.member_type == "cash" else None,
        "agent_name": "Demo CashBridge Agent Suresh" if req.member_type == "cash" else None,
        "status": "active",
        "joined_at": datetime.utcnow().isoformat(),
    }
    DEMO_MEMBERSHIPS.append(new_mem)
    group["member_count"] += 1

    return {
        "message": "Member added successfully.",
        "membership": new_mem,
    }


@router.post("/memberships/{membership_id}/exit")
async def exit_membership(membership_id: str):
    """
    Exits a member from a group while preserving historical financial records.
    """
    mem = next((m for m in DEMO_MEMBERSHIPS if m["id"] == membership_id), None)
    if not mem:
        raise APIException("Membership record not found.", status_code=status.HTTP_404_NOT_FOUND)
    mem["status"] = "exited"
    return group_service.exit_member(membership_id, "organizer_id")
