-- Migration 024: Monthly Auction & Payout Engine

-- 1. Extend auctions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auctions' AND column_name = 'status') THEN
        ALTER TABLE auctions ADD COLUMN status TEXT NOT NULL DEFAULT 'open';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auctions' AND column_name = 'closed_at') THEN
        ALTER TABLE auctions ADD COLUMN closed_at TIMESTAMPTZ NULL;
    END IF;
END $$;

-- 2. Extend auction_bids table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auction_bids' AND column_name = 'status') THEN
        ALTER TABLE auction_bids ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
    END IF;
END $$;

-- 3. Extend payouts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payouts' AND column_name = 'status') THEN
        ALTER TABLE payouts ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payouts' AND column_name = 'assigned_agent_id') THEN
        ALTER TABLE payouts ADD COLUMN assigned_agent_id UUID NULL REFERENCES profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payouts' AND column_name = 'cash_proof_url') THEN
        ALTER TABLE payouts ADD COLUMN cash_proof_url TEXT NULL;
    END IF;
END $$;

-- Constraints & Indexes
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_agent ON payouts(assigned_agent_id) WHERE assigned_agent_id IS NOT NULL;
