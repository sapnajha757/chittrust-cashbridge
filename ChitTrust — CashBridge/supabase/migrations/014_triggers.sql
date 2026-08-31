-- Migration 014: Functions and Triggers for Automatic Profile Creation & Timestamps

-- 1. Reusable Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_update_profiles_updated_at ON profiles;
CREATE TRIGGER trg_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_groups_updated_at ON groups;
CREATE TRIGGER trg_update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_agents_updated_at ON agents;
CREATE TRIGGER trg_update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Automatic Profile and Trust Score Initialization Trigger on auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_name TEXT;
    default_phone TEXT;
BEGIN
    default_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Member');
    default_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone_number');

    -- Automatically insert corresponding record in public.profiles with default user_type = 'member'
    INSERT INTO public.profiles (id, phone_number, name, user_type)
    VALUES (
        NEW.id,
        default_phone,
        default_name,
        'member'::user_type
    )
    ON CONFLICT (id) DO NOTHING;

    -- Automatically initialize trust score with default score of 100
    INSERT INTO public.trust_scores (user_id, score)
    VALUES (NEW.id, 100)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind handle_new_user trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
