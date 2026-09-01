from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.schemas.auction import (
    CreateAuctionRequest,
    PlaceBidRequest,
    BidResponse,
    AuctionResponse,
)
from app.services.auction_service import auction_service

from app.auth.deps import get_current_user, require_member, require_organizer, require_admin

router = APIRouter()

@router.post("/groups/{group_id}/auctions", response_model=AuctionResponse, status_code=status.HTTP_201_CREATED)
async def open_group_auction(
    group_id: str,
    req: CreateAuctionRequest,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Opens a monthly auction session for the specified group.
    Verifies organizer authorization and prevents duplicate auctions.
    """
    organizer_id = current_user["id"]
    return auction_service.open_auction(group_id, req.month_number, organizer_id)


@router.post("/auctions/{auction_id}/bids", response_model=BidResponse, status_code=status.HTTP_201_CREATED)
async def place_auction_bid(
    auction_id: str,
    req: PlaceBidRequest,
    current_user: Dict[str, Any] = Depends(require_member)
):
    """
    Submits or updates member bid discount.
    Validates range (0 < bid_discount < total_pot) using Decimal precision.
    """
    membership_id = req.membership_id or "33333333-3333-3333-3333-333333333333"
    return auction_service.place_bid(auction_id, membership_id, req.bid_discount)


@router.get("/auctions/{auction_id}", response_model=AuctionResponse)
async def get_auction_details(
    auction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns auction details, status, highest discount, and winner summary.
    """
    return auction_service.get_auction(auction_id)


@router.get("/auctions/{auction_id}/bids", response_model=List[BidResponse])
async def list_auction_bids(
    auction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns list of bids. Anonymizes bidder identities for non-organizer members.
    """
    user_role = (current_user.get("user_type") or current_user.get("role") or "").lower()
    is_organizer = user_role in ["organizer", "admin"]
    return auction_service.list_bids(auction_id, is_organizer=is_organizer)


@router.post("/auctions/{auction_id}/close", response_model=AuctionResponse)
async def close_group_auction(
    auction_id: str,
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Closes auction, determines winner (highest discount wins), and creates transactional Payout record.
    """
    organizer_id = current_user["id"]
    return auction_service.close_auction(auction_id, organizer_id)
