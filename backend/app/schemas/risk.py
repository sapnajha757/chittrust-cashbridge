from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ResolveRiskFlagRequest(BaseModel):
    status: str = Field(..., pattern="^(resolved|dismissed|reviewing)$")
    resolution_note: str = Field(..., min_length=3)

class RiskFlagResponse(BaseModel):
    id: str
    group_id: Optional[str] = None
    group_name: Optional[str] = None
    user_id: Optional[str] = None
    member_name: Optional[str] = None
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    type: str
    severity: str
    score: int
    description: str
    entity_type: str
    entity_id: Optional[str] = None
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_note: Optional[str] = None
