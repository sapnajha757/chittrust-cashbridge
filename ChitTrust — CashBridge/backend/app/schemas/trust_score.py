from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TrustScoreResponse(BaseModel):
    user_id: str
    score: int
    base_score: int = 100
    total_on_time: int
    total_late: int
    total_late_within_7_days: int = 0
    total_late_over_7_days: int = 0
    total_missed: int
    current_streak: int
    total_bonus_points: int = 0
    version: int = 1
    last_updated: datetime

class TrustScoreEventResponse(BaseModel):
    id: str
    user_id: str
    contribution_id: Optional[str] = None
    month_number: Optional[int] = None
    payment_mode: Optional[str] = None
    event_type: str
    points: int
    streak_before: int
    streak_after: int
    score_before: int
    score_after: int
    reason: str
    created_at: datetime

class TrustScoreBreakdownItem(BaseModel):
    label: str
    count: int
    points_per_unit: int
    total_points: int

class TrustScoreBreakdownResponse(BaseModel):
    user_id: str
    score: int
    base_score: int = 100
    on_time_contribution_points: int
    late_within_7_days_penalties: int
    late_over_7_days_penalties: int
    missed_payment_penalties: int
    consistency_streak_bonuses: int
    breakdown_items: List[TrustScoreBreakdownItem]

class TrustScoreExplanationResponse(BaseModel):
    user_id: str
    score: int
    explanation_summary: str
    key_factors: List[str]
    disclaimer: str = "Trust Score reflects contribution consistency within ChitTrust. It is not a bank credit score or guarantee of creditworthiness."
