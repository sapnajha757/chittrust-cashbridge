from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.schemas.analytics import PlatformOverviewKPIs, GroupAnalyticsResponse, AgentPerformanceSummary
from app.services.analytics_service import analytics_service

from app.auth.deps import get_current_user, require_organizer, require_admin

router = APIRouter()

@router.get("/overview", response_model=PlatformOverviewKPIs)
async def get_platform_overview_kpis(
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Returns platform overview KPIs dynamically calculated from source-of-truth tables.
    """
    organizer_id = current_user["id"]
    return analytics_service.get_overview_kpis(organizer_id)


@router.get("/groups/{group_id}/analytics", response_model=GroupAnalyticsResponse)
async def get_group_analytics(
    group_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns group-level collection, payment mode breakdown, and Trust Score stats.
    """
    return analytics_service.get_group_analytics(group_id)


@router.get("/agents/analytics", response_model=List[AgentPerformanceSummary])
async def get_agent_performance_analytics(
    current_user: Dict[str, Any] = Depends(require_organizer)
):
    """
    Returns CashBridge Agent collection volumes, reputation scores, and open flag counts.
    """
    return analytics_service.get_agent_analytics()
