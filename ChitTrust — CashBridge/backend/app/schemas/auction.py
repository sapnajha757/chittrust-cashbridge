from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CreateAuctionRequest(BaseModel):
    month_number: int = Field(..., gt=0)

class PlaceBidRequest(BaseModel):
    bid_discount: float = Field(..., gt=0)

class BidResponse(BaseModel):
    id: str
    auction_id: str
    membership_id: str
    bid_discount: float
    status: str
    created_at: datetime
    is_my_bid: bool = False

class AuctionWinnerSummary(BaseModel):
    membership_id: str
    member_name: str
    winning_bid_discount: float
    payout_amount: float

class AuctionResponse(BaseModel):
    id: str
    group_id: str
    group_name: str
    month_number: int
    auction_type: str
    status: str
    total_pot: float
    winning_bid_discount: Optional[float] = None
    payout_amount: Optional[float] = None
    winner: Optional[AuctionWinnerSummary] = None
    bids_count: int = 0
    highest_bid_discount: Optional[float] = None
    closed_at: Optional[datetime] = None
    created_at: datetime
