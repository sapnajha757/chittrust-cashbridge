-- Migration 007: Contributions Table

CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    month_number INTEGER NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    mode payment_mode NOT NULL,
    confirmed_via confirmation_method NOT NULL,
    paid_on_time BOOLEAN DEFAULT FALSE,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    photo_proof_url TEXT NULL,
    transaction_reference TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_membership_month_contribution UNIQUE (membership_id, month_number),
    CONSTRAINT chk_contribution_month_positive CHECK (month_number > 0),
    CONSTRAINT chk_contribution_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_cash_mode_validation CHECK (
        (mode = 'cash' AND (photo_proof_url IS NOT NULL OR confirmed_via = 'agent')) OR
        (mode = 'upi')
    )
);

COMMENT ON TABLE contributions IS 'Monthly financial contribution logs for both cash and UPI payment modes.';
