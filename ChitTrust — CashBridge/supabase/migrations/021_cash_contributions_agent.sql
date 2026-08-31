-- Migration 021: CashBridge Agent Cash Contributions & In-App Notifications

-- 1. Add recorded_by_agent_id column to contributions table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contributions' AND column_name = 'recorded_by_agent_id'
    ) THEN
        ALTER TABLE contributions ADD COLUMN recorded_by_agent_id UUID NULL REFERENCES profiles(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contributions_agent ON contributions(recorded_by_agent_id) WHERE recorded_by_agent_id IS NOT NULL;

-- 2. In-App Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_id UUID NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

COMMENT ON TABLE notifications IS 'In-app notification records for member cash receipts, auctions, and account alerts.';

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update read status on own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
