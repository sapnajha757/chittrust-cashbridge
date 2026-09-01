from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PlatformOverviewKPIs(BaseModel):
    active_groups: int
    total_members: int
    active_agents: int
    total_monthly_pool: float
    collection_rate: float
    on_time_payment_rate: float
    average_trust_score: float
    cash_percentage: float
    digital_percentage: float

class GroupAnalyticsResponse(BaseModel):
    group_id: str
    group_name: str
    total_members: int
    active_members: int
    current_month: int
    monthly_contribution: float
    total_monthly_pool: float
    collected_amount: float
    collection_rate: float
    on_time_rate: float
    cash_amount: float
    digital_amount: float
    auction_status: str
    payout_status: str
    average_trust_score: float

class AgentPerformanceSummary(BaseModel):
    agent_id: str
    name: str
    region: str
    total_entries: int
    total_amount_handled: float
    reputation_score: float
    open_flags_count: int

class TrustScoreTrendItem(BaseModel):
    month: str
    average_score: int
    contributions_collected: float
