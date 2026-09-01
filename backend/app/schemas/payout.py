from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AssignAgentPayoutRequest(BaseModel):
    agent_id: str

class ConfirmCashPayoutRequest(BaseModel):
    cash_proof_url: Optional[str] = None
    notes: Optional[str] = None

class PayoutResponse(BaseModel):
    id: str
    group_id: str
    group_name: str
    membership_id: str
    member_name: str
    month_number: int
    amount: float
    auction_discount: float
    mode: str
    status: str
    payout_date: datetime
    assigned_agent_id: Optional[str] = None
    assigned_agent_name: Optional[str] = None
    cash_proof_url: Optional[str] = None
    transaction_reference: Optional[str] = None
    created_at: datetime
