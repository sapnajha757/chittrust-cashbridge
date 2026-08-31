-- Migration 002: PostgreSQL Enums for ChitTrust + CashBridge

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
