export type UserRole = 'organizer' | 'member' | 'agent' | 'admin';

export type MemberType = 'digital' | 'cash';

export type PaymentMethod = 'digital' | 'cash';

export type ContributionStatus = 'pending' | 'verified' | 'failed';

export type GroupStatus = 'active' | 'closed' | 'paused';

export type AuctionStatus = 'upcoming' | 'bidding' | 'completed' | 'cancelled';

export type AgentVerificationStatus = 'pending' | 'verified' | 'blocked';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  region?: string;
  kyc_verified?: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  total_amount: number;
  duration_months: number;
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
  member_type: MemberType;
  agent_id?: string;
  joined_at: string;
  has_won_payout: boolean;
  status: 'active' | 'exited' | 'suspended';
}

export interface Agent {
  id: string;
  user_id: string;
  service_area: string;
  verification_status: AgentVerificationStatus;
  total_cash_collected: number;
  active_collections_count: number;
  reputation_score: number;
}

export interface Contribution {
  id: string;
  group_id: string;
  user_id: string;
  membership_id: string;
  amount: number;
  month_number: number;
  method: PaymentMethod;
  confirmed_via: string;
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
  score: number; // 0 to 850
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
