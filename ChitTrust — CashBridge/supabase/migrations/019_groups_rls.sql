-- Migration 019: RLS Security Policies for Group Invitations & Refined Group Access

ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- 1. Organizers can manage invitations for groups they organize
DROP POLICY IF EXISTS "Organizers can manage invitations for their groups" ON group_invitations;
CREATE POLICY "Organizers can manage invitations for their groups"
    ON group_invitations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = group_invitations.group_id
            AND g.organizer_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = group_invitations.group_id
            AND g.organizer_id = auth.uid()
        )
    );

-- 2. Invited users can view invitations sent to their phone number
DROP POLICY IF EXISTS "Users can view invitations matching their phone number" ON group_invitations;
CREATE POLICY "Users can view invitations matching their phone number"
    ON group_invitations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.phone_number = group_invitations.phone_number
        )
    );
