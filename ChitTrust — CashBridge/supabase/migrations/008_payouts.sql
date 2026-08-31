-- Migration 008: Payouts Table

CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    membership_id UUID NOT NULL REFERENCES memberships(id),
    month_number INTEGER NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    mode payout_mode NOT NULL,
    payout_date TIMESTAMPTZ DEFAULT NOW(),
    auction_discount NUMERIC(12,2) NULL,
    transaction_reference TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_group_month_payout UNIQUE (group_id, month_number),
    CONSTRAINT chk_payout_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_payout_month_positive CHECK (month_number > 0),
    CONSTRAINT chk_auction_discount_nonnegative CHECK (auction_discount IS NULL OR auction_discount >= 0)
);

COMMENT ON TABLE payouts IS 'Disbursement payout logs awarded to monthly chit auction / lucky draw winners.';
