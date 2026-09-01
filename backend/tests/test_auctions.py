import pytest
from app.services.auction_service import AuctionService
from app.core.exceptions import APIException

def test_auction_flow():
    auction = AuctionService.open_auction("g_test_1", 1, "org_1")
    assert auction["status"] == "open"
    assert auction["total_pot"] == 10000.0

    bid1 = AuctionService.place_bid(auction["id"], "m_1", 1000.0)
    assert bid1["bid_discount"] == 1000.0

    bid2 = AuctionService.place_bid(auction["id"], "m_2", 1500.0)
    assert bid2["bid_discount"] == 1500.0

    closed = AuctionService.close_auction(auction["id"], "org_1")
    assert closed["status"] == "closed"
    assert closed["winning_bid_discount"] == 1500.0
    assert closed["payout_amount"] == 8500.0 # 10000 - 1500

def test_invalid_bid_amount():
    auction = AuctionService.open_auction("g_test_2", 1, "org_1")
    with pytest.raises(APIException):
        AuctionService.place_bid(auction["id"], "m_1", -100.0)
    with pytest.raises(APIException):
        AuctionService.place_bid(auction["id"], "m_1", 12000.0) # > total_pot
