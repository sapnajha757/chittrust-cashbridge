-- Migration 003: Public Profiles Table (Linked to Supabase Auth)

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

COMMENT ON TABLE profiles IS 'Public user profiles mirroring Supabase auth users with domain roles and KYC verification state.';
