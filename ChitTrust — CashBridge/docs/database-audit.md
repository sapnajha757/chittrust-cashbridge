# Database Schema & Security Audit 🗄️

## Overview

The database layer consists of **26 PostgreSQL migration scripts** (`000_full_schema.sql` through `025_analytics_notifications_risk.sql`) running on Supabase PostgreSQL.

---

## 📋 Database Tables & RLS Matrix (18 Tables)

| # | Table Name | Purpose | RLS Status | Primary Security Constraint |
| :- | :--- | :--- | :--- | :--- |
| 1 | `profiles` | User profiles & user roles | ENABLED | `auth.uid() = id` |
| 2 | `groups` | Savings groups & pot parameters | ENABLED | `organizer_id = auth.uid()` |
| 3 | `memberships` | User group memberships & cash agent mapping | ENABLED | Member/organizer access |
| 4 | `agents` | CashBridge agent reputation & metrics | ENABLED | Agent self / verified status |
| 5 | `contributions` | Contribution ledger (UPI & Cash) | ENABLED | Member / organizer / assigned agent |
| 6 | `payouts` | Monthly payout records & cash handovers | ENABLED | Member / organizer / assigned agent |
| 7 | `trust_scores` | Centralized trust score snapshots | ENABLED | Member self / organizer access |
| 8 | `trust_score_events` | Immutable trust score change history | ENABLED | Member self / organizer access |
| 9 | `auctions` | Monthly bidding & lucky draw sessions | ENABLED | Group member & organizer access |
| 10 | `auction_bids` | Member auction discount bids | ENABLED | Group member access |
| 11 | `audit_logs` | Append-only security audit log | ENABLED | Append-only policy |
| 12 | `group_invitations` | Member invitations (digital & cash) | ENABLED | Organizer / phone match access |
| 13 | `payment_webhook_events` | Webhook idempotency tracking | ENABLED | Service Role policy |
| 14 | `notifications` | In-app notification notifications | ENABLED | `user_id = auth.uid()` |
| 15 | `voice_pins` | Hashed voice PIN credentials | ENABLED | `user_id = auth.uid()` |
| 16 | `voice_sessions` | Voice IVR caller session state | ENABLED | `authenticated_user_id = auth.uid()` |
| 17 | `voice_call_logs` | Voice telephony activity log | ENABLED | `user_id = auth.uid()` |
| 18 | `risk_flags` | Operational review signals | ENABLED | Organizer / admin group access |

---

## ⚙️ Triggers & Constraints
- **Auto Profile Creation**: Trigger `on_auth_user_created` creates default `profiles` and `trust_scores` records upon Supabase Auth user registration.
- **Timestamp Triggers**: `update_updated_at_column()` auto-updates `updated_at` timestamps on `profiles`, `groups`, and `agents`.
- **Financial Invariants**: PostgreSQL `CHECK (total_amount > 0)`, `CHECK (contribution_per_month > 0)`, and `CHECK (bid_discount >= 0)` constraints enforced.
