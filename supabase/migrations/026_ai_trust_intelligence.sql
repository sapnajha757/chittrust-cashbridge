-- Migration 026: AI Trust Intelligence, Fraud Detection & Predictive Risk Engine

-- 1. AI Risk Assessments Table
CREATE TABLE IF NOT EXISTS ai_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NULL REFERENCES profiles(id),
    agent_id UUID NULL REFERENCES profiles(id),
    entity_type TEXT NOT NULL,
    entity_id UUID NULL,
    risk_type TEXT NOT NULL,
    risk_score INTEGER NOT NULL DEFAULT 0,
    confidence NUMERIC(3,2) NOT NULL DEFAULT 0.85,
    status TEXT NOT NULL DEFAULT 'open',
    evidence_json JSONB DEFAULT '{}'::jsonb,
    explanation TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    model_name TEXT NOT NULL DEFAULT 'chittrust-hybrid-v1',
    model_version TEXT NOT NULL DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ NULL,
    reviewed_by UUID NULL REFERENCES profiles(id),
    resolution_note TEXT NULL,

    CONSTRAINT chk_ai_risk_score CHECK (risk_score >= 0 AND risk_score <= 100),
    CONSTRAINT chk_ai_risk_confidence CHECK (confidence >= 0.0 AND confidence <= 1.0),
    CONSTRAINT chk_ai_risk_status CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed', 'escalated'))
);

-- 2. AI Audit Logs Table
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NULL REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NULL,
    model TEXT NOT NULL DEFAULT 'chittrust-hybrid-v1',
    prompt_version TEXT NOT NULL DEFAULT 'v1',
    result_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Usage Tracking Logs Table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES profiles(id),
    purpose TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'chittrust-hybrid-v1',
    estimated_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_assessments_group ON ai_risk_assessments(group_id);
CREATE INDEX IF NOT EXISTS idx_ai_assessments_status ON ai_risk_assessments(status);
CREATE INDEX IF NOT EXISTS idx_ai_assessments_score ON ai_risk_assessments(risk_score);
CREATE INDEX IF NOT EXISTS idx_ai_assessments_created ON ai_risk_assessments(created_at);

-- RLS Security Policies
ALTER TABLE ai_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organizers can view AI risk assessments for their groups" ON ai_risk_assessments;
CREATE POLICY "Organizers can view AI risk assessments for their groups" ON ai_risk_assessments FOR SELECT USING (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = ai_risk_assessments.group_id AND g.organizer_id = auth.uid())
);

DROP POLICY IF EXISTS "Organizers can update AI risk assessments for their groups" ON ai_risk_assessments;
CREATE POLICY "Organizers can update AI risk assessments for their groups" ON ai_risk_assessments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = ai_risk_assessments.group_id AND g.organizer_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view own AI audit logs" ON ai_audit_logs;
CREATE POLICY "Users can view own AI audit logs" ON ai_audit_logs FOR SELECT USING (actor_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own AI usage logs" ON ai_usage_logs;
CREATE POLICY "Users can view own AI usage logs" ON ai_usage_logs FOR SELECT USING (user_id = auth.uid());
