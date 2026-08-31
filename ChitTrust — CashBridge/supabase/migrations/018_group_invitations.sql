-- Migration 018: Group Invitations Table for Non-Registered Members

CREATE TABLE IF NOT EXISTS group_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    name TEXT NOT NULL,
    member_type member_type NOT NULL,
    agent_id UUID NULL REFERENCES profiles(id),
    invited_by UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, expired
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

    CONSTRAINT chk_invitation_status CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    CONSTRAINT chk_cash_invitation_requires_agent CHECK (
        (member_type = 'cash' AND agent_id IS NOT NULL) OR
        (member_type = 'digital')
    )
);

CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_phone ON group_invitations(phone_number);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status);

COMMENT ON TABLE group_invitations IS 'Pending invitations issued by organizers to users not yet registered on the platform.';
