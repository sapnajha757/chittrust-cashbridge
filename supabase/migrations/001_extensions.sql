-- Migration 001: PostgreSQL Extensions
-- Enable pgcrypto and uuid-ossp extensions for UUID generation and cryptographic functions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
