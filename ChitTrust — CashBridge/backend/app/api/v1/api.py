from fastapi import APIRouter
from app.api.v1.endpoints import health, users, groups, agents, contributions, payments, agent_cash, notifications

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(groups.router, prefix="/groups", tags=["Groups"])
api_router.include_router(agents.router, prefix="/agents", tags=["Agents"])
api_router.include_router(contributions.router, prefix="/contributions", tags=["Contributions"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(agent_cash.router, prefix="/agents", tags=["Agent Cash"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
