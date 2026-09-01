-- Migration 020: Contributions Payment Status Extension & Razorpay Webhook Idempotency

-- 1. Add payment_status column to contributions table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contributions' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE contributions ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';
        ALTER TABLE contributions ADD CONSTRAINT chk_contributions_payment_status 
            CHECK (payment_status IN ('pending', 'processing', 'successful', 'failed', 'refunded'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contributions' AND column_name = 'razorpay_order_id'
    ) THEN
        ALTER TABLE contributions ADD COLUMN razorpay_order_id TEXT NULL;
        ALTER TABLE contributions ADD COLUMN razorpay_payment_id TEXT NULL;
        ALTER TABLE contributions ADD COLUMN razorpay_signature TEXT NULL;
        ALTER TABLE contributions ADD COLUMN failure_reason TEXT NULL;
        ALTER TABLE contributions ADD COLUMN verified_at TIMESTAMPTZ NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contributions_razorpay_order ON contributions(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contributions_razorpay_payment ON contributions(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contributions_payment_status ON contributions(payment_status);

-- 2. Webhook Idempotency Tracking Table
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

CREATE INDEX IF NOT EXISTS idx_webhook_events_lookup ON payment_webhook_events(provider, event_id);

COMMENT ON TABLE payment_webhook_events IS 'Idempotency ledger for incoming payment gateway webhooks to prevent duplicate event processing.';

-- Enable RLS on payment_webhook_events
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service Role manages webhook events" ON payment_webhook_events;
CREATE POLICY "Service Role manages webhook events" ON payment_webhook_events FOR ALL USING (true) WITH CHECK (true);
