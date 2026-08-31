-- Migration 015: Row Level Security (RLS) Policies across all tables

-- Enable RLS on ALL 10 tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. PROFILES POLICIES
-- ============================================================================
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Organizers can read member profiles in their groups"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM groups g
            JOIN memberships m ON m.group_id = g.id
            WHERE g.organizer_id = auth.uid()
            AND m.user_id = profiles.id
        )
    );

CREATE POLICY "Users can update basic details of own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        -- user_type and kyc_verified modification guarded at application/trigger layer
    );

-- ============================================================================
-- 2. GROUPS POLICIES
-- ============================================================================
CREATE POLICY "Organizers can manage own groups"
    ON groups FOR ALL
    USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Members can view groups they belong to"
    ON groups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.group_id = groups.id
            AND m.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 3. MEMBERSHIPS POLICIES
-- ============================================================================
CREATE POLICY "Users can view memberships in their groups or self"
    ON memberships FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = memberships.group_id
            AND g.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can insert memberships into their groups"
    ON memberships FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = memberships.group_id
            AND g.organizer_id = auth.uid()
        )
    );

-- ============================================================================
-- 4. AGENTS POLICIES
-- ============================================================================
CREATE POLICY "Agents can view own agent profile"
    ON agents FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can view verified agent info"
    ON agents FOR SELECT
    USING (verified_status = 'verified');

-- ============================================================================
-- 5. CONTRIBUTIONS POLICIES
-- ============================================================================
CREATE POLICY "Members can view own contributions"
    ON contributions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.id = contributions.membership_id
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can view group contributions"
    ON contributions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            JOIN groups g ON g.id = m.group_id
            WHERE m.id = contributions.membership_id
            AND g.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Assigned agents can view and insert cash contributions"
    ON contributions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.id = contributions.membership_id
            AND m.agent_id = auth.uid()
        )
    );

CREATE POLICY "Assigned agents can record cash contributions"
    ON contributions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.id = contributions.membership_id
            AND m.agent_id = auth.uid()
        )
    );

-- ============================================================================
-- 6. PAYOUTS POLICIES
-- ============================================================================
CREATE POLICY "Members can view payouts for their group"
    ON payouts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.group_id = payouts.group_id
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can view payouts for their groups"
    ON payouts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = payouts.group_id
            AND g.organizer_id = auth.uid()
        )
    );

-- ============================================================================
-- 7. TRUST SCORES POLICIES
-- ============================================================================
CREATE POLICY "Users can read own trust score"
    ON trust_scores FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Organizers can view trust scores of members in their groups"
    ON trust_scores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM groups g
            JOIN memberships m ON m.group_id = g.id
            WHERE g.organizer_id = auth.uid()
            AND m.user_id = trust_scores.user_id
        )
    );

-- ============================================================================
-- 8. AUCTIONS & BIDS POLICIES
-- ============================================================================
CREATE POLICY "Group members and organizers can view group auctions"
    ON auctions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.group_id = auctions.group_id
            AND m.user_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = auctions.group_id
            AND g.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Group members can view bids for their group auctions"
    ON auction_bids FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auctions a
            JOIN memberships m ON m.group_id = a.group_id
            WHERE a.id = auction_bids.auction_id
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can place auction bids"
    ON auction_bids FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.id = auction_bids.membership_id
            AND m.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 9. AUDIT LOGS POLICIES
-- ============================================================================
CREATE POLICY "Users can read own audit logs"
    ON audit_logs FOR SELECT
    USING (actor_id = auth.uid());

CREATE POLICY "Append-only audit log insertion"
    ON audit_logs FOR INSERT
    WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);
