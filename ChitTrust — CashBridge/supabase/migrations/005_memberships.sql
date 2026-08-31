-- Migration 005: Memberships Table

CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_type member_type NOT NULL,
    agent_id UUID NULL REFERENCES profiles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    status membership_status DEFAULT 'active',

    CONSTRAINT uq_active_group_membership UNIQUE (group_id, user_id),
    CONSTRAINT chk_cash_member_requires_agent CHECK (
        (member_type = 'cash' AND agent_id IS NOT NULL) OR
        (member_type = 'digital')
    )
);

COMMENT ON TABLE memberships IS 'Associates users with chit groups as digital or cash members, requiring cash members to have assigned agents.';
