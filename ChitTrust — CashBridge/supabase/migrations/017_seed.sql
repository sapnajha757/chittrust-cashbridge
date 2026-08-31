-- Migration 017: Development & Demo Seed Data
-- CAUTION: DEMO/DEVELOPMENT DATA ONLY. DO NOT USE IN PRODUCTION.

DO $$
DECLARE
    demo_org_id UUID := '00000000-0000-0000-0000-000000000001';
    demo_agent_id UUID := '00000000-0000-0000-0000-000000000002';
    demo_dig_member_id UUID := '00000000-0000-0000-0000-000000000003';
    demo_cash_member_id UUID := '00000000-0000-0000-0000-000000000004';
    
    demo_group_id UUID := '11111111-1111-1111-1111-111111111111';
    mem_dig_id UUID := '22222222-2222-2222-2222-222222222222';
    mem_cash_id UUID := '33333333-3333-3333-3333-333333333333';
BEGIN

    -- 1. Insert Demo Auth Users (Mirrored into auth.users for local test environments)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, phone, raw_user_meta_data, role, aud)
    VALUES
        (demo_org_id, '00000000-0000-0000-0000-000000000000', 'organizer.demo@chittrust.in', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '+919900000001', '{"full_name":"Demo Organizer Ramesh"}', 'authenticated', 'authenticated'),
        (demo_agent_id, '00000000-0000-0000-0000-000000000000', 'agent.demo@chittrust.in', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '+919900000002', '{"full_name":"Demo CashBridge Agent Suresh"}', 'authenticated', 'authenticated'),
        (demo_dig_member_id, '00000000-0000-0000-0000-000000000000', 'digital.member@chittrust.in', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '+919900000003', '{"full_name":"Demo Digital Member Priya"}', 'authenticated', 'authenticated'),
        (demo_cash_member_id, '00000000-0000-0000-0000-000000000000', 'cash.member@chittrust.in', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '+919900000004', '{"full_name":"Demo Cash Member Anil"}', 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Profiles (Updated roles)
    INSERT INTO profiles (id, phone_number, name, user_type, region, kyc_verified)
    VALUES
        (demo_org_id, '+919900000001', 'Demo Organizer Ramesh', 'organizer', 'Jaipur Ward 12', true),
        (demo_agent_id, '+919900000002', 'Demo CashBridge Agent Suresh', 'agent', 'Jaipur Ward 12', true),
        (demo_dig_member_id, '+919900000003', 'Demo Digital Member Priya', 'member', 'Jaipur Ward 12', true),
        (demo_cash_member_id, '+919900000004', 'Demo Cash Member Anil', 'member', 'Jaipur Ward 12', false)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        user_type = EXCLUDED.user_type,
        region = EXCLUDED.region;

    -- 3. Insert Agent Profile Record
    INSERT INTO agents (id, verified_status, total_entries, total_amount_handled, reputation_score)
    VALUES (demo_agent_id, 'verified', 12, 30000.00, 98.50)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Insert Demo Chit Group
    INSERT INTO groups (id, name, total_amount, duration_months, contribution_per_month, auction_type, organizer_id, status)
    VALUES (
        demo_group_id,
        'Ganesh Traders Community Chit #1',
        30000.00,
        12,
        2500.00,
        'bid',
        demo_org_id,
        'active'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 5. Insert Memberships (1 Digital, 1 Cash with Agent assigned)
    INSERT INTO memberships (id, group_id, user_id, member_type, agent_id, status)
    VALUES
        (mem_dig_id, demo_group_id, demo_dig_member_id, 'digital', NULL, 'active'),
        (mem_cash_id, demo_group_id, demo_cash_member_id, 'cash', demo_agent_id, 'active')
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Sample Contributions
    INSERT INTO contributions (membership_id, month_number, amount, mode, confirmed_via, paid_on_time, payment_date, transaction_reference)
    VALUES (mem_dig_id, 1, 2500.00, 'upi', 'app', true, NOW() - INTERVAL '30 days', 'UPI/2026/089123')
    ON CONFLICT (membership_id, month_number) DO NOTHING;

    INSERT INTO contributions (membership_id, month_number, amount, mode, confirmed_via, paid_on_time, payment_date, photo_proof_url)
    VALUES (mem_cash_id, 1, 2500.00, 'cash', 'agent', true, NOW() - INTERVAL '29 days', 'cash-payment-proofs/demo_receipt_001.jpg')
    ON CONFLICT (membership_id, month_number) DO NOTHING;

    -- 7. Initialize Trust Scores
    INSERT INTO trust_scores (user_id, score, total_on_time, total_late, total_missed, current_streak)
    VALUES
        (demo_dig_member_id, 750, 1, 0, 0, 1),
        (demo_cash_member_id, 750, 1, 0, 0, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        score = EXCLUDED.score,
        total_on_time = EXCLUDED.total_on_time;

    -- 8. Audit Log Entry
    INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (demo_org_id, 'group_created', 'groups', demo_group_id, '{"demo": true, "environment": "seed"}');

END $$;
