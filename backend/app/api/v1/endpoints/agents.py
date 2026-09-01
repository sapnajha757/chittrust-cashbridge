from fastapi import APIRouter, Query
from typing import List, Optional
from app.schemas.group import AgentSummaryResponse

router = APIRouter()

DEMO_AGENTS = [
    {
        "id": "00000000-0000-0000-0000-000000000002",
        "name": "Suresh Patel (CashBridge Agent)",
        "phone_number": "+919900000002",
        "region": "Jaipur Ward 12",
        "reputation_score": 98.5,
        "verified_status": "verified",
    },
    {
        "id": "00000000-0000-0000-0000-000000000005",
        "name": "Ramesh Kumar (Doorstep Collection)",
        "phone_number": "+919900000005",
        "region": "Jaipur Ward 14",
        "reputation_score": 96.0,
        "verified_status": "verified",
    },
]

@router.get("/available", response_model=List[AgentSummaryResponse], tags=["Agents"])
async def list_available_agents(region: Optional[str] = None):
    """
    Returns a list of verified CashBridge agents available for assignment.
    """
    if region:
        # Match region
        matched = [a for a in DEMO_AGENTS if region.lower() in a["region"].lower()]
        if matched:
            return matched
    return DEMO_AGENTS
