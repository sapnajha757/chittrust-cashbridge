from fastapi import APIRouter
from app.api.v1.endpoints import health, users, groups, agents

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(groups.router, prefix="/groups", tags=["Groups"])
api_router.include_router(agents.router, prefix="/agents", tags=["Agents"])
