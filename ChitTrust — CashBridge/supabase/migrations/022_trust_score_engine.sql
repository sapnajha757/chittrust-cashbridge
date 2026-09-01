-- Migration 022: Explainable Trust Score Engine & Event Ledger

-- 1. Create trust_score_events table for auditable score point history
CREATE TABLE IF NOT EXISTS trust_score_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contribution_id UUID NULL REFERENCES contributions(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    points INTEGER NOT NULL,
    streak_before INTEGER DEFAULT 0,
    streak_after INTEGER DEFAULT 0,
    score_before INTEGER DEFAULT 100,
    score_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_event_type CHECK (event_type IN ('on_time', 'late_within_7_days', 'late_over_7_days', 'missed', 'streak_bonus')),
    CONSTRAINT uq_user_contribution_event UNIQUE (user_id, contribution_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_trust_events_user_id ON trust_score_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_created_at ON trust_score_events(created_at);

COMMENT ON TABLE trust_score_events IS 'Audit ledger recording every credit trust score point transaction and streak bonus.';

-- 2. Extend trust_scores table columns safely
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trust_scores' AND column_name = 'base_score'
    ) THEN
        ALTER TABLE trust_scores ADD COLUMN base_score INTEGER DEFAULT 100;
        ALTER TABLE trust_scores ADD COLUMN total_late_within_7_days INTEGER DEFAULT 0;
        ALTER TABLE trust_scores ADD COLUMN total_late_over_7_days INTEGER DEFAULT 0;
        ALTER TABLE trust_scores ADD COLUMN total_bonus_points INTEGER DEFAULT 0;
        ALTER TABLE trust_scores ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
END $$;

-- 3. Enable RLS on trust_score_events
ALTER TABLE trust_score_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own trust score events" ON trust_score_events;
CREATE POLICY "Users can read own trust score events" ON trust_score_events FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Organizers can view trust score events of members in their groups" ON trust_score_events;
CREATE POLICY "Organizers can view trust score events of members in their groups" ON trust_score_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM groups g
        JOIN memberships m ON m.group_id = g.id
        WHERE g.organizer_id = auth.uid() AND m.user_id = trust_score_events.user_id
    )
);
