from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UserProfileResponse(BaseModel):
    id: str
    phone_number: Optional[str] = None
    name: str
    user_type: str
    region: Optional[str] = None
    kyc_verified: bool = False

@router.get("/me", response_model=UserProfileResponse, tags=["Users"])
async def get_current_user_profile():
    """
    Returns authenticated user profile metadata.
    """
    return UserProfileResponse(
        id="demo-user-id",
        name="ChitTrust Member",
        user_type="member",
        kyc_verified=True,
    )
