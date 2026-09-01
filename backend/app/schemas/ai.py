from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class MemberFeatures(BaseModel):
    user_id: str
    payment_on_time_ratio: float
    late_payment_ratio: float
    missed_payment_ratio: float
    current_streak: int
    average_payment_delay_days: float
    contribution_count: int

class AgentFeatures(BaseModel):
    agent_id: str
    entries_per_day_baseline: float
    entries_today: int
    cash_volume: float
    proof_upload_ratio: float
    unusual_hour_ratio: float

class GroupHealthSummary(BaseModel):
    group_id: str
    group_name: str
    health_status: str = Field(..., pattern="^(Healthy|Needs Attention|At Risk)$")
    on_time_rate: float
    unresolved_flags_count: int
    summary_text: str

class AIRiskAssessmentResponse(BaseModel):
    id: str
    group_id: Optional[str] = None
    group_name: Optional[str] = None
    user_id: Optional[str] = None
    member_name: Optional[str] = None
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    entity_type: str
    entity_id: Optional[str] = None
    risk_type: str
    risk_score: int
    confidence: float
    status: str
    evidence_json: Dict[str, Any]
    explanation: str
    recommended_action: str
    model_name: str
    model_version: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    resolution_note: Optional[str] = None

class ReviewAIRiskAssessmentRequest(BaseModel):
    status: str = Field(..., pattern="^(resolved|dismissed|reviewing|escalated)$")
    resolution_note: str = Field(..., min_length=3)

class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    language: str = Field("hi", pattern="^(hi|en)$")

class AIChatResponse(BaseModel):
    reply_text: str
    intent_detected: str
    structured_data: Optional[Dict[str, Any]] = None
    confidence: float = 0.95

class AITrustScoreExplanationResponse(BaseModel):
    score: int
    language: str
    explanation: str
    key_reasons: List[str]
