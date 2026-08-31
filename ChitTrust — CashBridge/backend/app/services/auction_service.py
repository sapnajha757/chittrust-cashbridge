import uuid
import logging
from decimal import Decimal
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.exceptions import APIException
from app.services.notification_service import notification_service

logger = logging.getLogger("chittrust.auctions")

DEMO_AUCTIONS_DB: List[Dict[str, Any]] = [
    {
        "id": "a1111111-1111-1111-1111-111111111111",
        "group_id": "11111111-1111-1111-1111-111111111111",
        "group_name": "Ganesh Traders Community Chit #1",
        "month_number": 3,
        "auction_type": "bid",
        "status": "open",
        "total_pot": 10000.0,
        "winning_bid_discount": None,
        "payout_amount": None,
        "winner": None,
        "bids_count": 3,
        "highest_bid_discount": 1500.0,
        "closed_at": None,
        "created_at": datetime.utcnow().isoformat(),
    }
]

DEMO_BIDS_DB: List[Dict[str, Any]] = [
    {
        "id": "b1111111-1111-1111-1111-111111111111",
        "auction_id": "a1111111-1111-1111-1111-111111111111",
        "membership_id": "33333333-3333-3333-3333-333333333333",
        "member_name": "Anil Verma (Cash Member)",
        "bid_discount": 1500.0,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "id": "b2222222-2222-2222-2222-222222222222",
        "auction_id": "a1111111-1111-1111-1111-111111111111",
        "membership_id": "22222222-2222-2222-2222-222222222222",
        "member_name": "Rahul Sharma",
        "bid_discount": 1200.0,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "id": "b3333333-3333-3333-3333-333333333333",
        "auction_id": "a1111111-1111-1111-1111-111111111111",
        "membership_id": "44444444-4444-4444-4444-444444444444",
        "member_name": "Neha Gupta",
        "bid_discount": 1000.0,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
    },
]

DEMO_PAYOUTS_DB: List[Dict[str, Any]] = []

class AuctionService:
    @classmethod
    def get_auction(cls, auction_id: str) -> Dict[str, Any]:
        auction = next((a for a in DEMO_AUCTIONS_DB if a["id"] == auction_id), None)
        if not auction:
            raise APIException("Auction session not found.", status_code=404)
        return auction

    @classmethod
    def open_auction(cls, group_id: str, month_number: int, organizer_id: str) -> Dict[str, Any]:
        existing = next((a for a in DEMO_AUCTIONS_DB if a["group_id"] == group_id and a["month_number"] == month_number), None)
        if existing:
            return existing

        auction_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        record = {
            "id": auction_id,
            "group_id": group_id,
            "group_name": "Ganesh Traders Community Chit #1",
            "month_number": month_number,
            "auction_type": "bid",
            "status": "open",
            "total_pot": 10000.0,
            "winning_bid_discount": None,
            "payout_amount": None,
            "winner": None,
            "bids_count": 0,
            "highest_bid_discount": 0.0,
            "closed_at": None,
            "created_at": now,
        }
        DEMO_AUCTIONS_DB.append(record)
        logger.info(f"Auction {auction_id} opened for group {group_id} Month {month_number}")
        return record

    @classmethod
    def place_bid(cls, auction_id: str, membership_id: str, bid_discount: float) -> Dict[str, Any]:
        auction = cls.get_auction(auction_id)
        if auction["status"] != "open":
            raise APIException("Bidding is closed for this auction session.", status_code=400)

        # Decimal precision monetary validation
        pot_dec = Decimal(str(auction["total_pot"]))
        bid_dec = Decimal(str(bid_discount))

        if bid_dec <= 0 or bid_dec >= pot_dec:
            raise APIException(f"Bid discount must be greater than 0 and less than total pot ₹{pot_dec:,.2f}.", status_code=400)

        # Replace existing draft bid for member
        global DEMO_BIDS_DB
        DEMO_BIDS_DB = [b for b in DEMO_BIDS_DB if not (b["auction_id"] == auction_id and b["membership_id"] == membership_id)]

        bid_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        bid_record = {
            "id": bid_id,
            "auction_id": auction_id,
            "membership_id": membership_id,
            "member_name": "Anil Verma (Cash Member)",
            "bid_discount": float(bid_dec),
            "status": "active",
            "created_at": now,
        }
        DEMO_BIDS_DB.append(bid_record)

        # Update auction stats
        bids = [b for b in DEMO_BIDS_DB if b["auction_id"] == auction_id and b["status"] == "active"]
        auction["bids_count"] = len(bids)
        auction["highest_bid_discount"] = max(b["bid_discount"] for b in bids)

        logger.info(f"Bid {bid_id} placed: ₹{bid_discount} discount")
        return bid_record

    @classmethod
    def close_auction(cls, auction_id: str, organizer_id: str) -> Dict[str, Any]:
        auction = cls.get_auction(auction_id)
        if auction["status"] != "open":
            return auction

        bids = [b for b in DEMO_BIDS_DB if b["auction_id"] == auction_id and b["status"] == "active"]
        if not bids:
            raise APIException("Cannot close auction without valid bids.", status_code=400)

        # Winner selection: Highest discount wins; earliest bid breaks ties
        sorted_bids = sorted(bids, key=lambda b: (-b["bid_discount"], b["created_at"]))
        winning_bid = sorted_bids[0]

        # Calculate exact payout using Decimal arithmetic
        pot_dec = Decimal(str(auction["total_pot"]))
        disc_dec = Decimal(str(winning_bid["bid_discount"]))
        payout_dec = pot_dec - disc_dec

        now = datetime.utcnow().isoformat()
        auction["status"] = "closed"
        auction["closed_at"] = now
        auction["winning_bid_discount"] = float(disc_dec)
        auction["payout_amount"] = float(payout_dec)
        auction["winner"] = {
            "membership_id": winning_bid["membership_id"],
            "member_name": winning_bid["member_name"],
            "winning_bid_discount": float(disc_dec),
            "payout_amount": float(payout_dec),
        }

        # Create transactional Payout record
        payout_id = str(uuid.uuid4())
        payout_record = {
            "id": payout_id,
            "group_id": auction["group_id"],
            "group_name": auction["group_name"],
            "membership_id": winning_bid["membership_id"],
            "member_name": winning_bid["member_name"],
            "month_number": auction["month_number"],
            "amount": float(payout_dec),
            "auction_discount": float(disc_dec),
            "mode": "cash" if "Cash" in winning_bid["member_name"] else "upi",
            "status": "pending",
            "payout_date": now,
            "assigned_agent_id": "00000000-0000-0000-0000-000000000002",
            "assigned_agent_name": "Suresh Patel (CashBridge Agent)",
            "cash_proof_url": None,
            "transaction_reference": None,
            "created_at": now,
        }
        DEMO_PAYOUTS_DB.append(payout_record)

        # Issue in-app receipt notification to winner
        notification_service.send_notification(
            user_id="00000000-0000-0000-0000-000000000004",
            title="🎉 You won this month's auction!",
            message=f"Winning discount: ₹{disc_dec:,.2f}. Payout amount: ₹{payout_dec:,.2f} (Status: Payout Pending).",
            notification_type="auction_winner",
            related_entity_id=payout_id,
        )

        logger.info(f"Auction {auction_id} closed. Winner: {winning_bid['member_name']}. Payout: ₹{payout_dec}")
        return auction

    @classmethod
    def list_bids(cls, auction_id: str, is_organizer: bool = False) -> List[Dict[str, Any]]:
        bids = [b for b in DEMO_BIDS_DB if b["auction_id"] == auction_id]
        if not is_organizer:
            # Anonymize bidder identities for non-organizer members
            return [
                {
                    "id": b["id"],
                    "auction_id": b["auction_id"],
                    "membership_id": b["membership_id"],
                    "bid_discount": b["bid_discount"],
                    "status": b["status"],
                    "created_at": b["created_at"],
                    "is_my_bid": b["membership_id"] == "33333333-3333-3333-3333-333333333333",
                }
                for b in bids
            ]
        return bids

auction_service = AuctionService()
