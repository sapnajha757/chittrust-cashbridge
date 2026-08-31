from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    total_amount: float = Field(..., gt=0)
    duration_months: int = Field(..., gt=0, le=120)
    contribution_per_month: float = Field(..., gt=0)
    auction_type: str = Field(..., pattern="^(bid|lucky_draw)$")

    @field_validator("contribution_per_month")
    @classmethod
    def validate_contribution(cls, v: float, info) -> float:
        total = info.data.get("total_amount")
        if total and v > total:
            raise ValueError("Monthly contribution cannot exceed total pool amount")
        return v

class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    auction_type: Optional[str] = Field(None, pattern="^(bid|lucky_draw)$")
    status: Optional[str] = Field(None, pattern="^(active|paused|closed)$")

class GroupResponse(BaseModel):
    id: str
    name: str
    total_amount: float
    duration_months: int
    contribution_per_month: float
    auction_type: str
    organizer_id: str
    status: str
    member_count: int = 0
    created_at: datetime
    updated_at: datetime

class MemberAddRequest(BaseModel):
    name: str = Field(..., min_length=2)
    phone_number: str = Field(..., min_length=10)
    member_type: str = Field(..., pattern="^(digital|cash)$")
    agent_id: Optional[str] = None

    @field_validator("agent_id")
    @classmethod
    def validate_agent_for_cash(cls, v: Optional[str], info) -> Optional[str]:
        m_type = info.data.get("member_type")
        if m_type == "cash" and not v:
            raise ValueError("A verified CashBridge Agent must be assigned for cash members.")
        if m_type == "digital" and v:
            raise ValueError("Digital members should not have an assigned agent.")
        return v

class MembershipResponse(BaseModel):
    id: str
    group_id: str
    user_id: str
    member_name: str
    phone_number: str
    member_type: str
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    status: str
    joined_at: datetime

class InvitationResponse(BaseModel):
    id: str
    group_id: str
    phone_number: str
    name: str
    member_type: str
    agent_id: Optional[str] = None
    invited_by: str
    status: str
    created_at: datetime

class AgentSummaryResponse(BaseModel):
    id: str
    name: str
    phone_number: str
    region: str
    reputation_score: float
    verified_status: str
