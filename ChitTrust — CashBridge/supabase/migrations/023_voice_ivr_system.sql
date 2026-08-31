-- Migration 023: Voice IVR System & PIN Authentication Ledger

-- 1. Voice PIN Credentials Table
CREATE TABLE IF NOT EXISTS voice_pins (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    pin_hash TEXT NOT NULL,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Voice Call Sessions Table
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

CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(authenticated_user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_started ON voice_sessions(started_at);

-- 3. Voice Call Logs Table
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

CREATE INDEX IF NOT EXISTS idx_voice_logs_user ON voice_call_logs(user_id);

-- Enable RLS
ALTER TABLE voice_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own voice PIN" ON voice_pins FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own voice sessions" ON voice_sessions FOR SELECT USING (authenticated_user_id = auth.uid());
CREATE POLICY "Users can view own voice call logs" ON voice_call_logs FOR SELECT USING (user_id = auth.uid());
