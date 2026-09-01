-- Migration 025: Analytics, Multi-Channel Notifications & Risk Intelligence Subsystem

-- 1. Risk Flags Table (Needs Review Operational Flags)
CREATE TABLE IF NOT EXISTS risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NULL REFERENCES profiles(id),
    agent_id UUID NULL REFERENCES profiles(id),
    type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM',
    score INTEGER NOT NULL DEFAULT 20,
    description TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ NULL,
    resolved_by UUID NULL REFERENCES profiles(id),
    resolution_note TEXT NULL,

    CONSTRAINT chk_risk_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_risk_status CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed'))
);

-- 2. Extend Notifications Table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'channel') THEN
        ALTER TABLE notifications ADD COLUMN channel TEXT NOT NULL DEFAULT 'in_app';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'status') THEN
        ALTER TABLE notifications ADD COLUMN status TEXT NOT NULL DEFAULT 'sent';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_risk_flags_group ON risk_flags(group_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_status ON risk_flags(status);
CREATE INDEX IF NOT EXISTS idx_risk_flags_created ON risk_flags(created_at);

-- Enable RLS
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organizers can view risk flags for their groups" ON risk_flags;
CREATE POLICY "Organizers can view risk flags for their groups" ON risk_flags FOR SELECT USING (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = risk_flags.group_id AND g.organizer_id = auth.uid())
);

DROP POLICY IF EXISTS "Organizers can update risk flags for their groups" ON risk_flags;
CREATE POLICY "Organizers can update risk flags for their groups" ON risk_flags FOR UPDATE USING (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = risk_flags.group_id AND g.organizer_id = auth.uid())
);
