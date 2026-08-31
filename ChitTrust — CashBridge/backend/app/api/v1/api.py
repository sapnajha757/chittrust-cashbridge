from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    users,
    groups,
    agents,
    contributions,
    payments,
    agent_cash,
    notifications,
    trust_score,
    voice,
    voice_telephony,
    voice_demo,
    auctions,
    payouts,
    analytics,
    risk,
    ai_intelligence,
    demo,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(groups.router, prefix="/groups", tags=["Groups"])
api_router.include_router(agents.router, prefix="/agents", tags=["Agents"])
api_router.include_router(contributions.router, prefix="/contributions", tags=["Contributions"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(agent_cash.router, prefix="/agents", tags=["Agent Cash"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(trust_score.router, prefix="/users", tags=["Trust Score"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice AI"])
api_router.include_router(voice_telephony.router, prefix="/voice", tags=["Voice Telephony Webhooks"])
api_router.include_router(voice_demo.router, prefix="/voice", tags=["Voice Simulator API"])
api_router.include_router(auctions.router, tags=["Auctions"])
api_router.include_router(payouts.router, tags=["Payouts"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(risk.router, prefix="/risk", tags=["Risk & Review"])
api_router.include_router(ai_intelligence.router, prefix="/ai", tags=["AI Trust Intelligence"])
api_router.include_router(demo.router, prefix="/demo", tags=["Demo Mode Controls"])
