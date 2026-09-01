from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CashContributionRequest(BaseModel):
    membership_id: str
    amount: float = Field(..., gt=0)
    month_number: Optional[int] = Field(None, gt=0)
    photo_proof_url: str

class CashContributionResponse(BaseModel):
    success: bool = True
    contribution_id: str
    group_id: str
    membership_id: str
    member_name: str
    amount: float
    month_number: int
    mode: str = "cash"
    confirmed_via: str = "agent"
    status: str = "successful"
    recorded_by_agent_id: str
    recorded_by_agent_name: str
    photo_proof_url: str
    created_at: datetime

class AgentGroupSummary(BaseModel):
    id: str
    name: str
    total_amount: float
    contribution_per_month: float
    cash_member_count: int
    status: str

class AgentCashMemberSummary(BaseModel):
    membership_id: str
    group_id: str
    user_id: str
    member_name: str
    phone_number: str
    monthly_contribution: float
    current_month_due: int
    is_current_month_paid: bool
    agent_id: str

class ProofURLResponse(BaseModel):
    contribution_id: str
    proof_url: str
    expires_at: datetime
