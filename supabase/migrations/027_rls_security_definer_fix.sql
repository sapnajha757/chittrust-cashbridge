-- Migration 027: RLS Security Definer Helper Functions & Non-Recursive Policies

-- ============================================================================
-- 1. HELPER FUNCTIONS (SECURITY DEFINER to bypass RLS circular evaluation)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_group_organizer(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.groups
        WHERE id = _group_id AND organizer_id = _user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.memberships
        WHERE group_id = _group_id AND user_id = _user_id AND status = 'active'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_organizer_of_member(_organizer_id uuid, _member_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.groups g
        JOIN public.memberships m ON m.group_id = g.id
        WHERE g.organizer_id = _organizer_id
        AND m.user_id = _member_user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_agent(_membership_id uuid, _agent_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.memberships
        WHERE id = _membership_id AND agent_id = _agent_id
    );
$$;

CREATE OR REPLACE FUNCTION public.get_membership_user_id(_membership_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT user_id FROM public.memberships WHERE id = _membership_id;
$$;

CREATE OR REPLACE FUNCTION public.get_membership_group_id(_membership_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT group_id FROM public.memberships WHERE id = _membership_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_phone_number(_user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT phone_number FROM public.profiles WHERE id = _user_id;
$$;

-- Automatic Profile and Trust Score Initialization Trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    default_name TEXT;
    default_phone TEXT;
BEGIN
    default_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Member');
    default_phone := COALESCE(NULLIF(NEW.phone, ''), NULLIF(NEW.raw_user_meta_data->>'phone_number', ''));

    BEGIN
        INSERT INTO public.profiles (id, phone_number, name, user_type)
        VALUES (
            NEW.id,
            default_phone,
            default_name,
            'member'::public.user_type
        )
        ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name,
            phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number);
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO public.profiles (id, phone_number, name, user_type)
        VALUES (NEW.id, NULL, default_name, 'member'::public.user_type)
        ON CONFLICT (id) DO NOTHING;
    END;

    BEGIN
        INSERT INTO public.trust_scores (user_id, score)
        VALUES (NEW.id, 100)
        ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    RETURN NEW;
END;
$$;

-- Grant execute on security functions
GRANT EXECUTE ON FUNCTION public.is_group_organizer(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_organizer_of_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_assigned_agent(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_membership_user_id(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_membership_group_id(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_phone_number(uuid) TO authenticated, anon;


-- ============================================================================
-- 2. REFACTOR PROFILES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Organizers can read member profiles in their groups" ON profiles;
DROP POLICY IF EXISTS "Users can update basic details of own profile" ON profiles;

CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Organizers can read member profiles in their groups"
    ON profiles FOR SELECT
    USING (public.is_organizer_of_member(auth.uid(), id));

CREATE POLICY "Users can update basic details of own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- ============================================================================
-- 3. REFACTOR GROUPS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Organizers can manage own groups" ON groups;
DROP POLICY IF EXISTS "Members can view groups they belong to" ON groups;

CREATE POLICY "Organizers can manage own groups"
    ON groups FOR ALL
    USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Members can view groups they belong to"
    ON groups FOR SELECT
    USING (public.is_group_member(id, auth.uid()));


-- ============================================================================
-- 4. REFACTOR MEMBERSHIPS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view memberships in their groups or self" ON memberships;
DROP POLICY IF EXISTS "Organizers can insert memberships into their groups" ON memberships;

CREATE POLICY "Users can view memberships in their groups or self"
    ON memberships FOR SELECT
    USING (user_id = auth.uid() OR public.is_group_organizer(group_id, auth.uid()));

CREATE POLICY "Organizers can insert memberships into their groups"
    ON memberships FOR INSERT
    WITH CHECK (public.is_group_organizer(group_id, auth.uid()));


-- ============================================================================
-- 5. REFACTOR GROUP INVITATIONS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Organizers can manage invitations for their groups" ON group_invitations;
DROP POLICY IF EXISTS "Users can view invitations matching their phone number" ON group_invitations;

CREATE POLICY "Organizers can manage invitations for their groups"
    ON group_invitations FOR ALL
    USING (public.is_group_organizer(group_id, auth.uid()))
    WITH CHECK (public.is_group_organizer(group_id, auth.uid()));

CREATE POLICY "Users can view invitations matching their phone number"
    ON group_invitations FOR SELECT
    USING (phone_number = public.get_user_phone_number(auth.uid()));


-- ============================================================================
-- 6. REFACTOR CONTRIBUTIONS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Members can view own contributions" ON contributions;
DROP POLICY IF EXISTS "Organizers can view group contributions" ON contributions;
DROP POLICY IF EXISTS "Assigned agents can view and insert cash contributions" ON contributions;
DROP POLICY IF EXISTS "Assigned agents can record cash contributions" ON contributions;

CREATE POLICY "Members can view own contributions"
    ON contributions FOR SELECT
    USING (public.get_membership_user_id(membership_id) = auth.uid());

CREATE POLICY "Organizers can view group contributions"
    ON contributions FOR SELECT
    USING (public.is_group_organizer(public.get_membership_group_id(membership_id), auth.uid()));

CREATE POLICY "Assigned agents can view and insert cash contributions"
    ON contributions FOR SELECT
    USING (public.is_assigned_agent(membership_id, auth.uid()));

CREATE POLICY "Assigned agents can record cash contributions"
    ON contributions FOR INSERT
    WITH CHECK (public.is_assigned_agent(membership_id, auth.uid()));


-- ============================================================================
-- 7. REFACTOR PAYOUTS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Members can view payouts for their group" ON payouts;
DROP POLICY IF EXISTS "Organizers can view payouts for their groups" ON payouts;

CREATE POLICY "Members can view payouts for their group"
    ON payouts FOR SELECT
    USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Organizers can view payouts for their groups"
    ON payouts FOR SELECT
    USING (public.is_group_organizer(group_id, auth.uid()));


-- ============================================================================
-- 8. REFACTOR TRUST SCORES & EVENTS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can read own trust score" ON trust_scores;
DROP POLICY IF EXISTS "Organizers can view trust scores of members in their groups" ON trust_scores;
DROP POLICY IF EXISTS "Users can read own trust score events" ON trust_score_events;
DROP POLICY IF EXISTS "Organizers can view trust score events of members in their grou" ON trust_score_events;

CREATE POLICY "Users can read own trust score"
    ON trust_scores FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Organizers can view trust scores of members in their groups"
    ON trust_scores FOR SELECT
    USING (public.is_organizer_of_member(auth.uid(), user_id));

CREATE POLICY "Users can read own trust score events"
    ON trust_score_events FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Organizers can view trust score events of members in their groups"
    ON trust_score_events FOR SELECT
    USING (public.is_organizer_of_member(auth.uid(), user_id));


-- ============================================================================
-- 9. REFACTOR AUCTIONS & BIDS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Group members and organizers can view group auctions" ON auctions;
DROP POLICY IF EXISTS "Group members can view bids for their group auctions" ON auction_bids;
DROP POLICY IF EXISTS "Group members can place auction bids" ON auction_bids;

CREATE POLICY "Group members and organizers can view group auctions"
    ON auctions FOR SELECT
    USING (public.is_group_member(group_id, auth.uid()) OR public.is_group_organizer(group_id, auth.uid()));

CREATE POLICY "Group members can view bids for their group auctions"
    ON auction_bids FOR SELECT
    USING (public.is_group_member(public.get_membership_group_id(membership_id), auth.uid()));

CREATE POLICY "Group members can place auction bids"
    ON auction_bids FOR INSERT
    WITH CHECK (public.get_membership_user_id(membership_id) = auth.uid());


-- ============================================================================
-- 10. REFACTOR RISK FLAGS & AI ASSESSMENTS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Organizers can view risk flags for their groups" ON risk_flags;
DROP POLICY IF EXISTS "Organizers can update risk flags for their groups" ON risk_flags;
DROP POLICY IF EXISTS "Organizers can view AI risk assessments for their groups" ON ai_risk_assessments;
DROP POLICY IF EXISTS "Organizers can update AI risk assessments for their groups" ON ai_risk_assessments;

CREATE POLICY "Organizers can view risk flags for their groups"
    ON risk_flags FOR SELECT
    USING (public.is_group_organizer(group_id, auth.uid()));

CREATE POLICY "Organizers can update risk flags for their groups"
    ON risk_flags FOR UPDATE
    USING (public.is_group_organizer(group_id, auth.uid()));

CREATE POLICY "Organizers can view AI risk assessments for their groups"
    ON ai_risk_assessments FOR SELECT
    USING (public.is_group_organizer(group_id, auth.uid()));

CREATE POLICY "Organizers can update AI risk assessments for their groups"
    ON ai_risk_assessments FOR UPDATE
    USING (public.is_group_organizer(group_id, auth.uid()));
