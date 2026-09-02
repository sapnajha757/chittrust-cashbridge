import logging
from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.exceptions import APIException
from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.auth")

security = HTTPBearer(auto_error=False)

# Default development fallback profile when auth is not provided in demo/dev mode
DEMO_PROFILES: Dict[str, Dict[str, Any]] = {
    "00000000-0000-0000-0000-000000000001": {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "Demo Organizer Vikram",
        "phone_number": "+919900000001",
        "user_type": "organizer",
        "kyc_verified": True,
    },
    "00000000-0000-0000-0000-000000000002": {
        "id": "00000000-0000-0000-0000-000000000002",
        "name": "Suresh Patel (CashBridge Agent)",
        "phone_number": "+919900000002",
        "user_type": "agent",
        "kyc_verified": True,
    },
    "00000000-0000-0000-0000-000000000003": {
        "id": "00000000-0000-0000-0000-000000000003",
        "name": "Demo Digital Member Priya",
        "phone_number": "+919900000003",
        "user_type": "member",
        "kyc_verified": True,
    },
    "00000000-0000-0000-0000-000000000004": {
        "id": "00000000-0000-0000-0000-000000000004",
        "name": "Anil Verma (Cash Member)",
        "phone_number": "+919900000004",
        "user_type": "member",
        "kyc_verified": True,
    },
}

def is_demo_fallback_allowed() -> bool:
    """
    Demo mode fallback is allowed when DEMO_MODE is True, UNLESS running in production environment.
    """
    effective_env = (settings.APP_ENV or settings.ENVIRONMENT).lower()
    if effective_env == "production":
        return False
    return bool(settings.DEMO_MODE) is True


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """
    Validates Supabase Bearer JWT token and retrieves authenticated user profile.
    Strictly returns HTTP 401 Unauthorized in production when JWT is missing or invalid.
    """
    raw_auth_header = request.headers.get("Authorization")
    if raw_auth_header and not credentials:
        # Authorization header is supplied, but HTTPBearer failed to parse it (e.g., malformed or non-Bearer scheme)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials format. Expected Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if credentials:
        if not credentials.credentials or (credentials.scheme and credentials.scheme.lower() != "bearer"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials format. Expected Bearer token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = credentials.credentials
        client = get_supabase_client()
        if client:
            try:
                # Validate token via Supabase Auth API
                user_resp = client.auth.get_user(token)
                if user_resp and user_resp.user:
                    user_id = user_resp.user.id
                    # Fetch profile metadata from DB
                    prof_res = client.table("profiles").select("*").eq("id", user_id).execute()
                    if prof_res.data and len(prof_res.data) > 0:
                        return prof_res.data[0]
                    # Return basic profile if profile record not found in public.profiles yet
                    return {
                        "id": user_id,
                        "name": user_resp.user.email or "Authenticated Member",
                        "phone_number": user_resp.user.phone or "",
                        "user_type": user_resp.user.user_metadata.get("role", "member"),
                        "kyc_verified": True,
                    }
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid or expired authentication token.",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
            except HTTPException:
                raise
            except Exception as err:
                logger.warning(f"JWT Token validation failed: {err}")
                # Whenever an authorization token is supplied but validation fails, ALWAYS return 401
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid, expired, or malformed authentication token.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Database authentication service unavailable.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Missing credentials: Strictly reject unauthenticated requests
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication credentials were not provided.",
        headers={"WWW-Authenticate": "Bearer"},
    )

def require_role(allowed_roles: list[str]):
    """
    Dependency factory to enforce role-based authorization guards.
    Returns HTTP 403 Forbidden for unauthorized role access.
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = (current_user.get("user_type") or current_user.get("role") or "member").lower()
        allowed_lower = [r.lower() for r in allowed_roles]
        if user_role not in allowed_lower and user_role != "admin":
            logger.warning(f"Role authorization denied for user {current_user.get('id')} with role {user_role}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action forbidden for user role '{user_role}'. Required roles: {allowed_roles}"
            )
        return current_user
    return role_checker

require_member = require_role(["member", "organizer", "agent", "admin"])
require_organizer = require_role(["organizer", "admin"])
require_agent = require_role(["agent", "admin"])
require_admin = require_role(["admin"])
