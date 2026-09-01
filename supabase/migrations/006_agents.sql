-- Migration 006: Agents Table

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    verified_status agent_verification_status DEFAULT 'pending',
    total_entries INTEGER DEFAULT 0,
    total_amount_handled NUMERIC(14,2) DEFAULT 0,
    reputation_score NUMERIC(5,2) DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_total_entries_nonnegative CHECK (total_entries >= 0),
    CONSTRAINT chk_total_amount_handled_nonnegative CHECK (total_amount_handled >= 0),
    CONSTRAINT chk_reputation_score_range CHECK (reputation_score >= 0 AND reputation_score <= 100)
);

COMMENT ON TABLE agents IS 'CashBridge doorstep agent verification profiles and cash transaction metrics.';
