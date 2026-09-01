from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UPIOrderCreateRequest(BaseModel):
    membership_id: str
    month_number: Optional[int] = Field(None, gt=0)

class UPIOrderResponse(BaseModel):
    order_id: str
    amount_paise: int
    amount_rupees: float
    currency: str = "INR"
    key_id: str
    membership_id: str
    month_number: int
    notes: Dict[str, Any]

class UPIVerifyRequest(BaseModel):
    membership_id: str
    month_number: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class ContributionResponse(BaseModel):
    id: str
    membership_id: str
    group_id: Optional[str] = None
    month_number: int
    amount: float
    mode: str
    confirmed_via: str
    payment_status: str
    paid_on_time: bool
    payment_date: Optional[datetime] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    transaction_reference: Optional[str] = None
    created_at: datetime

class ContributionSummaryResponse(BaseModel):
    group_id: str
    total_expected_amount: float
    collected_amount: float
    pending_amount: float
    successful_count: int
    pending_count: int
    failed_count: int

class RazorpayWebhookPayload(BaseModel):
    entity: str
    account_id: Optional[str] = None
    event: str
    contains: List[str] = []
    payload: Dict[str, Any]
    created_at: int
