import logging
from typing import Optional, Dict, Any
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("chittrust.db")

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """
    Returns singleton instance of Supabase Client initialized with Service Role key
    for backend database transactions and admin operations.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or "placeholder" in settings.SUPABASE_URL:
        logger.warning("SUPABASE_URL is unconfigured or using placeholder.")
        return None

    try:
        # Service role key bypasses RLS for backend server-side operations
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        _supabase_client = create_client(settings.SUPABASE_URL, key)
        logger.info(f"Initialized Supabase Client for {settings.SUPABASE_URL}")
        return _supabase_client
    except Exception as err:
        logger.error(f"Failed to initialize Supabase client: {err}")
        return None
