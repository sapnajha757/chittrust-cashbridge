-- Migration 013: Performance and Lookup Indexes

CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

CREATE INDEX IF NOT EXISTS idx_groups_organizer_id ON groups(organizer_id);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);

CREATE INDEX IF NOT EXISTS idx_memberships_group_id ON memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_agent_id ON memberships(agent_id);

CREATE INDEX IF NOT EXISTS idx_contributions_membership_id ON contributions(membership_id);
CREATE INDEX IF NOT EXISTS idx_contributions_month_number ON contributions(month_number);
CREATE INDEX IF NOT EXISTS idx_contributions_payment_date ON contributions(payment_date);
CREATE INDEX IF NOT EXISTS idx_contributions_tx_ref ON contributions(transaction_reference) WHERE transaction_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payouts_group_id ON payouts(group_id);
CREATE INDEX IF NOT EXISTS idx_payouts_membership_id ON payouts(membership_id);

CREATE INDEX IF NOT EXISTS idx_auctions_group_id ON auctions(group_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction_id ON auction_bids(auction_id);

CREATE INDEX IF NOT EXISTS idx_trust_scores_user_id ON trust_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
