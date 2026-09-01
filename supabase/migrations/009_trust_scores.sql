-- Migration 009: Trust Scores Table

CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 100,
    total_on_time INTEGER DEFAULT 0,
    total_late INTEGER DEFAULT 0,
    total_missed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_score_nonnegative CHECK (score >= 0),
    CONSTRAINT chk_total_on_time_nonnegative CHECK (total_on_time >= 0),
    CONSTRAINT chk_total_late_nonnegative CHECK (total_late >= 0),
    CONSTRAINT chk_total_missed_nonnegative CHECK (total_missed >= 0),
    CONSTRAINT chk_current_streak_nonnegative CHECK (current_streak >= 0)
);

COMMENT ON TABLE trust_scores IS 'Tracks user trust ratings and reliability metrics without discriminating between cash and digital payment modes.';
