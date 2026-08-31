-- Migration 011: Auction Bids Table

CREATE TABLE IF NOT EXISTS auction_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    bid_discount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_bid_discount_nonnegative CHECK (bid_discount >= 0)
);

COMMENT ON TABLE auction_bids IS 'Individual bidding entries submitted by group members during live monthly chit auctions.';
