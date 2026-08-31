-- Migration 010: Auctions Table

CREATE TABLE IF NOT EXISTS auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    month_number INTEGER NOT NULL,
    winner_membership_id UUID NULL REFERENCES memberships(id),
    winning_bid_discount NUMERIC(12,2) NULL,
    conducted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_group_month_auction UNIQUE (group_id, month_number),
    CONSTRAINT chk_auction_month_positive CHECK (month_number > 0),
    CONSTRAINT chk_winning_bid_discount_nonnegative CHECK (winning_bid_discount IS NULL OR winning_bid_discount >= 0)
);

COMMENT ON TABLE auctions IS 'Monthly chit auctions and draw logs per group.';
