-- ============================================================================
-- CHITTRUST + CASHBRIDGE: FULL SUPABASE DATABASE SCHEMA MIGRATION
-- Combine 001 through 024 for single-shot execution in Supabase SQL Editor
-- ============================================================================

-- 001_extensions.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 002_enums.sql
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('organizer', 'member', 'agent', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_type') THEN
        CREATE TYPE member_type AS ENUM ('digital', 'cash');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_status') THEN
        CREATE TYPE group_status AS ENUM ('active', 'closed', 'paused');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auction_type') THEN
        CREATE TYPE auction_type AS ENUM ('bid', 'lucky_draw');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status') THEN
        CREATE TYPE membership_status AS ENUM ('active', 'exited', 'suspended');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_mode') THEN
        CREATE TYPE payment_mode AS ENUM ('upi', 'cash');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'confirmation_method') THEN
        CREATE TYPE confirmation_method AS ENUM ('app', 'ivr', 'agent', 'system');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_verification_status') THEN
        CREATE TYPE agent_verification_status AS ENUM ('pending', 'verified', 'blocked');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_mode') THEN
        CREATE TYPE payout_mode AS ENUM ('upi', 'cash');
    END IF;
END $$;

-- 003_profiles.sql
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE,
    name TEXT NOT NULL,
    user_type user_type NOT NULL DEFAULT 'member',
    region TEXT,
    kyc_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 004_groups.sql
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

-- 005_memberships.sql
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

-- 006_agents.sql
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

-- 007_contributions.sql
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
    payment_status TEXT NOT NULL DEFAULT 'pending',
    razorpay_order_id TEXT NULL,
    razorpay_payment_id TEXT NULL,
    razorpay_signature TEXT NULL,
    failure_reason TEXT NULL,
    verified_at TIMESTAMPTZ NULL,
    recorded_by_agent_id UUID NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_membership_month_contribution UNIQUE (membership_id, month_number),
    CONSTRAINT chk_contribution_month_positive CHECK (month_number > 0),
    CONSTRAINT chk_contribution_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_contributions_payment_status CHECK (payment_status IN ('pending', 'processing', 'successful', 'failed', 'refunded')),
    CONSTRAINT chk_cash_mode_validation CHECK (
        (mode = 'cash' AND (photo_proof_url IS NOT NULL OR confirmed_via = 'agent')) OR
        (mode = 'upi')
    )
);

-- 008_payouts.sql & 024_auctions_payouts_engine.sql
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    membership_id UUID NOT NULL REFERENCES memberships(id),
    month_number INTEGER NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    mode payout_mode NOT NULL,
    payout_date TIMESTAMPTZ DEFAULT NOW(),
    auction_discount NUMERIC(12,2) NULL,
    transaction_reference TEXT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    assigned_agent_id UUID NULL REFERENCES profiles(id),
    cash_proof_url TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_group_month_payout UNIQUE (group_id, month_number),
    CONSTRAINT chk_payout_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_payout_month_positive CHECK (month_number > 0),
    CONSTRAINT chk_auction_discount_nonnegative CHECK (auction_discount IS NULL OR auction_discount >= 0)
);

-- 009_trust_scores.sql
CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 100,
    base_score INTEGER DEFAULT 100,
    total_on_time INTEGER DEFAULT 0,
    total_late INTEGER DEFAULT 0,
    total_late_within_7_days INTEGER DEFAULT 0,
    total_late_over_7_days INTEGER DEFAULT 0,
    total_missed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    total_bonus_points INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_score_nonnegative CHECK (score >= 0),
    CONSTRAINT chk_total_on_time_nonnegative CHECK (total_on_time >= 0),
    CONSTRAINT chk_total_late_nonnegative CHECK (total_late >= 0),
    CONSTRAINT chk_total_missed_nonnegative CHECK (total_missed >= 0),
    CONSTRAINT chk_current_streak_nonnegative CHECK (current_streak >= 0)
);

-- 022_trust_score_engine.sql
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

-- 023_voice_ivr_system.sql
CREATE TABLE IF NOT EXISTS voice_pins (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    pin_hash TEXT NOT NULL,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'mock',
    provider_call_id TEXT NULL,
    caller_phone_hash TEXT NULL,
    language TEXT NOT NULL DEFAULT 'hi',
    state TEXT NOT NULL DEFAULT 'LANGUAGE_SELECTION',
    authenticated_user_id UUID NULL REFERENCES profiles(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ NULL,
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voice_session_id UUID NULL REFERENCES voice_sessions(id) ON DELETE SET NULL,
    user_id UUID NULL REFERENCES profiles(id),
    intent TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'hi',
    status TEXT NOT NULL DEFAULT 'success',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ DEFAULT NOW()
);

-- 010_auctions.sql & 024_auctions_payouts_engine.sql
CREATE TABLE IF NOT EXISTS auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    month_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    winner_membership_id UUID NULL REFERENCES memberships(id),
    winning_bid_discount NUMERIC(12,2) NULL,
    conducted_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_group_month_auction UNIQUE (group_id, month_number),
    CONSTRAINT chk_auction_month_positive CHECK (month_number > 0),
    CONSTRAINT chk_winning_bid_discount_nonnegative CHECK (winning_bid_discount IS NULL OR winning_bid_discount >= 0)
);

-- 011_auction_bids.sql & 024_auctions_payouts_engine.sql
CREATE TABLE IF NOT EXISTS auction_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    bid_discount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_bid_discount_nonnegative CHECK (bid_discount >= 0)
);

-- 012_audit_logs.sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NULL REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 018_group_invitations.sql
CREATE TABLE IF NOT EXISTS group_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    name TEXT NOT NULL,
    member_type member_type NOT NULL,
    agent_id UUID NULL REFERENCES profiles(id),
    invited_by UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

    CONSTRAINT chk_invitation_status CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    CONSTRAINT chk_cash_invitation_requires_agent CHECK (
        (member_type = 'cash' AND agent_id IS NOT NULL) OR
        (member_type = 'digital')
    )
);

-- 020_contributions_razorpay.sql
CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'razorpay',
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT TRUE,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    payload_metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT uq_provider_event_id UNIQUE (provider, event_id)
);

-- 021_cash_contributions_agent.sql
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

-- 013_indexes.sql
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_groups_organizer_id ON groups(organizer_id);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
CREATE INDEX IF NOT EXISTS idx_memberships_group_id ON memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_agent_id ON memberships(agent_id);
CREATE INDEX IF NOT EXISTS idx_contributions_membership_id ON contributions(membership_id);
CREATE INDEX IF NOT EXISTS idx_contributions_month_number ON contributions(month_number);
CREATE INDEX IF NOT EXISTS idx_contributions_payment_date ON contributions(payment_date);
CREATE INDEX IF NOT EXISTS idx_contributions_tx_ref ON contributions(transaction_reference) WHERE transaction_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contributions_razorpay_order ON contributions(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contributions_razorpay_payment ON contributions(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contributions_payment_status ON contributions(payment_status);
CREATE INDEX IF NOT EXISTS idx_contributions_agent ON contributions(recorded_by_agent_id) WHERE recorded_by_agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payouts_group_id ON payouts(group_id);
CREATE INDEX IF NOT EXISTS idx_payouts_membership_id ON payouts(membership_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_agent ON payouts(assigned_agent_id) WHERE assigned_agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auctions_group_id ON auctions(group_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction_id ON auction_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_trust_scores_user_id ON trust_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_user_id ON trust_score_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_created_at ON trust_score_events(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_phone ON group_invitations(phone_number);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_lookup ON payment_webhook_events(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(authenticated_user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_started ON voice_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_voice_logs_user ON voice_call_logs(user_id);

-- 014_triggers.sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_profiles_updated_at ON profiles;
CREATE TRIGGER trg_update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_groups_updated_at ON groups;
CREATE TRIGGER trg_update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_agents_updated_at ON agents;
CREATE TRIGGER trg_update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_name TEXT;
    default_phone TEXT;
BEGIN
    default_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Member');
    default_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone_number');

    INSERT INTO public.profiles (id, phone_number, name, user_type)
    VALUES (NEW.id, default_phone, default_name, 'member'::user_type)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.trust_scores (user_id, score, base_score)
    VALUES (NEW.id, 100, 100)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Organizers can read member profiles in their groups" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM groups g JOIN memberships m ON m.group_id = g.id WHERE g.organizer_id = auth.uid() AND m.user_id = profiles.id)
);
CREATE POLICY "Users can update basic details of own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Organizers can manage own groups" ON groups FOR ALL USING (organizer_id = auth.uid()) WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Members can view groups they belong to" ON groups FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.group_id = groups.id AND m.user_id = auth.uid())
);

CREATE POLICY "Users can view memberships in their groups or self" ON memberships FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM groups g WHERE g.id = memberships.group_id AND g.organizer_id = auth.uid())
);
CREATE POLICY "Organizers can insert memberships into their groups" ON memberships FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = memberships.group_id AND g.organizer_id = auth.uid())
);

CREATE POLICY "Agents can view own agent profile" ON agents FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can view verified agent info" ON agents FOR SELECT USING (verified_status = 'verified');

CREATE POLICY "Members can view own contributions" ON contributions FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.id = contributions.membership_id AND m.user_id = auth.uid())
);
CREATE POLICY "Organizers can view group contributions" ON contributions FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships m JOIN groups g ON g.id = m.group_id WHERE m.id = contributions.membership_id AND g.organizer_id = auth.uid())
);
CREATE POLICY "Assigned agents can view and insert cash contributions" ON contributions FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.id = contributions.membership_id AND m.agent_id = auth.uid())
);
CREATE POLICY "Assigned agents can record cash contributions" ON contributions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships m WHERE m.id = contributions.membership_id AND m.agent_id = auth.uid())
);

CREATE POLICY "Members can view payouts for their group" ON payouts FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.group_id = payouts.group_id AND m.user_id = auth.uid())
);
CREATE POLICY "Organizers can view payouts for their groups" ON payouts FOR SELECT USING (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = payouts.group_id AND g.organizer_id = auth.uid())
);

CREATE POLICY "Users can read own trust score" ON trust_scores FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Organizers can view trust scores of members in their groups" ON trust_scores FOR SELECT USING (
    EXISTS (SELECT 1 FROM groups g JOIN memberships m ON m.group_id = g.id WHERE g.organizer_id = auth.uid() AND m.user_id = trust_scores.user_id)
);

CREATE POLICY "Users can read own trust score events" ON trust_score_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Organizers can view trust score events of members in their groups" ON trust_score_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM groups g JOIN memberships m ON m.group_id = g.id WHERE g.organizer_id = auth.uid() AND m.user_id = trust_score_events.user_id)
);

CREATE POLICY "Group members and organizers can view group auctions" ON auctions FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.group_id = auctions.group_id AND m.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM groups g WHERE g.id = auctions.group_id AND g.organizer_id = auth.uid())
);
CREATE POLICY "Group members can view bids for their group auctions" ON auction_bids FOR SELECT USING (
    EXISTS (SELECT 1 FROM auctions a JOIN memberships m ON m.group_id = a.group_id WHERE a.id = auction_bids.auction_id AND m.user_id = auth.uid())
);
CREATE POLICY "Group members can place auction bids" ON auction_bids FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships m WHERE m.id = auction_bids.membership_id AND m.user_id = auth.uid())
);

CREATE POLICY "Users can read own audit logs" ON audit_logs FOR SELECT USING (actor_id = auth.uid());
CREATE POLICY "Append-only audit log insertion" ON audit_logs FOR INSERT WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

CREATE POLICY "Organizers can manage invitations for their groups" ON group_invitations FOR ALL USING (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = group_invitations.group_id AND g.organizer_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = group_invitations.group_id AND g.organizer_id = auth.uid())
);
CREATE POLICY "Users can view invitations matching their phone number" ON group_invitations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.phone_number = group_invitations.phone_number)
);

CREATE POLICY "Service Role manages webhook events" ON payment_webhook_events FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update read status on own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own voice PIN" ON voice_pins FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own voice sessions" ON voice_sessions FOR SELECT USING (authenticated_user_id = auth.uid());
CREATE POLICY "Users can view own voice call logs" ON voice_call_logs FOR SELECT USING (user_id = auth.uid());
