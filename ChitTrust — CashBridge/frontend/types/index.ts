export type UserRole = 'organizer' | 'digital_member' | 'cash_member' | 'agent';

export type PaymentMethod = 'digital' | 'cash';

export type ContributionStatus = 'pending' | 'verified' | 'failed';

export type GroupStatus = 'active' | 'completed' | 'pending';

export type AuctionStatus = 'upcoming' | 'bidding' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  monthly_contribution: number;
  total_members: number;
  cycle_months: number;
  current_cycle: number;
  status: GroupStatus;
  organizer_id: string;
  created_at: string;
}

export interface Membership {
  id: string;
  group_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  has_won_payout: boolean;
}

export interface Agent {
  id: string;
  user_id: string;
  service_area: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  total_cash_collected: number;
  active_collections_count: number;
}

export interface Contribution {
  id: string;
  group_id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  agent_id?: string;
  photo_proof_url?: string;
  status: ContributionStatus;
  collected_at?: string;
  verified_at?: string;
  created_at: string;
}

export interface Payout {
  id: string;
  group_id: string;
  winner_user_id: string;
  winning_bid_amount: number;
  payout_amount: number;
  dividend_per_member: number;
  disbursed_at?: string;
  cycle_number: number;
}

export interface TrustScore {
  user_id: string;
  score: number; // e.g., 300 to 850
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  digital_on_time_count: number;
  cash_on_time_count: number;
  late_count: number;
  updated_at: string;
}

export interface Auction {
  id: string;
  group_id: string;
  cycle_number: number;
  minimum_bid: number;
  highest_bid: number;
  winning_user_id?: string;
  status: AuctionStatus;
  starts_at: string;
  ends_at: string;
}
