import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def mock_supabase_user(user_id: str, email: str, role: str):
    """Helper to mock a Supabase Auth user object response."""
    user_obj = MagicMock()
    user_obj.id = user_id
    user_obj.email = email
    user_obj.phone = "+919900000099"
    user_obj.user_metadata = {"role": role}
    
    response_obj = MagicMock()
    response_obj.user = user_obj
    return response_obj


def test_production_mode_no_token_returns_401():
    """Requirement 18A & 19: APP_ENV=production + no token must return 401."""
    with patch.object(settings, "ENVIRONMENT", "production"), patch.object(settings, "DEMO_MODE", False):
        response = client.get("/api/v1/users/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        assert "not provided" in response.json()["detail"].lower() or "unauthorized" in response.json()["detail"].lower()


def test_production_mode_even_if_demo_mode_true_returns_401():
    """Requirement 19: APP_ENV=production + DEMO_MODE=true must NOT silently enable demo auth."""
    with patch.object(settings, "ENVIRONMENT", "production"), patch.object(settings, "DEMO_MODE", True):
        response = client.get("/api/v1/users/me")
        assert response.status_code == 401, f"Expected 401 in production, got {response.status_code}"


def test_invalid_token_returns_401():
    """Requirement 18B: Invalid Bearer token must return 401."""
    with patch("app.auth.deps.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.side_effect = Exception("Invalid JWT token")
        mock_get_client.return_value = mock_client

        headers = {"Authorization": "Bearer invalid.jwt.token"}
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower() or "malformed" in response.json()["detail"].lower()


def test_malformed_credentials_returns_401():
    """Requirement 18C: Malformed Authorization header returns 401."""
    headers = {"Authorization": "Basic invalid_scheme"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 401


def test_valid_member_jwt_access():
    """Requirement 18D: Valid Member JWT can access member endpoint."""
    with patch("app.auth.deps.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = mock_supabase_user("user-mem-101", "member@test.com", "member")
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": "user-mem-101",
                "name": "Test Member User",
                "phone_number": "+919900000101",
                "user_type": "member",
                "kyc_verified": True,
            }
        ]
        mock_get_client.return_value = mock_client

        headers = {"Authorization": "Bearer valid.member.jwt"}
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "user-mem-101"
        assert data["user_type"] == "member"


def test_member_to_admin_endpoint_forbidden():
    """Requirement 18H: Member user attempting Admin-only endpoint returns 403 Forbidden."""
    with patch("app.auth.deps.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = mock_supabase_user("user-mem-101", "member@test.com", "member")
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"id": "user-mem-101", "name": "Test Member", "user_type": "member", "kyc_verified": True}
        ]
        mock_get_client.return_value = mock_client

        headers = {"Authorization": "Bearer valid.member.jwt"}
        response = client.get("/api/v1/ai/risk-assessments", headers=headers)
        assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}"


def test_agent_to_organizer_endpoint_forbidden():
    """Requirement 18I: Agent user attempting Organizer-only endpoint returns 403 Forbidden."""
    with patch("app.auth.deps.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = mock_supabase_user("user-agent-202", "agent@test.com", "agent")
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"id": "user-agent-202", "name": "Test Agent", "user_type": "agent", "kyc_verified": True}
        ]
        mock_get_client.return_value = mock_client

        headers = {"Authorization": "Bearer valid.agent.jwt"}
        # Attempt to create a group (Organizer only)
        payload = {
            "name": "Unauthorized Group",
            "total_amount": 10000.0,
            "duration_months": 10,
            "contribution_per_month": 1000.0,
            "auction_type": "bid",
        }
        response = client.post("/api/v1/groups", json=payload, headers=headers)
        assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}"


def test_organizer_modifying_another_organizer_group_forbidden():
    """Requirement 18J & 7: Organizer A attempting to update Organizer B's group returns 403 Forbidden."""
    with patch("app.auth.deps.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        # Authenticated as Organizer B
        mock_client.auth.get_user.return_value = mock_supabase_user("org-b-id", "orgb@test.com", "organizer")
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"id": "org-b-id", "name": "Organizer B", "user_type": "organizer", "kyc_verified": True}
        ]
        mock_get_client.return_value = mock_client

        headers = {"Authorization": "Bearer valid.organizerb.jwt"}
        # Group 11111111-1111-1111-1111-111111111111 belongs to Organizer Vikram (00000000-0000-0000-0000-000000000001)
        payload = {"name": "Hacked Group Name"}
        response = client.patch("/api/v1/groups/11111111-1111-1111-1111-111111111111", json=payload, headers=headers)
        assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}"


def test_unauthenticated_request_returns_401():
    """Unauthenticated requests unconditionally return 401 Unauthorized."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    assert "not provided" in response.json()["detail"].lower()

