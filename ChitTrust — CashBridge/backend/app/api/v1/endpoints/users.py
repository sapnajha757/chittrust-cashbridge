from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.auth.deps import get_current_user

router = APIRouter()

class UserProfileResponse(BaseModel):
    id: str
    phone_number: Optional[str] = None
    name: str
    user_type: str
    region: Optional[str] = None
    kyc_verified: bool = False

@router.get("/me", response_model=UserProfileResponse, tags=["Users"])
async def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns authenticated user profile metadata derived from validated JWT.
    """
    return UserProfileResponse(
        id=current_user["id"],
        phone_number=current_user.get("phone_number"),
        name=current_user.get("name", "ChitTrust Member"),
        user_type=current_user.get("user_type", "member"),
        region=current_user.get("region"),
        kyc_verified=current_user.get("kyc_verified", True),
    )
