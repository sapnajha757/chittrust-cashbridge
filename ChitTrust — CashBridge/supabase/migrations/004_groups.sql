-- Migration 004: Chit Groups Table

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    contribution_per_month NUMERIC(12,2) NOT NULL,
    auction_type auction_type NOT NULL,
    organizer_id UUID NOT NULL REFERENCES profiles(id),
    status group_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_total_amount_positive CHECK (total_amount > 0),
    CONSTRAINT chk_duration_months_positive CHECK (duration_months > 0),
    CONSTRAINT chk_contribution_per_month_positive CHECK (contribution_per_month > 0),
    CONSTRAINT chk_contribution_lte_total CHECK (contribution_per_month <= total_amount)
);

COMMENT ON TABLE groups IS 'Chit fund committee groups managed by organizers.';
