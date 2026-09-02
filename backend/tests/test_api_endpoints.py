import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code in [200, 503]
    data = response.json()
    assert "status" in data
    assert "infrastructure" in data

def test_get_groups():
    response = client.get("/api/v1/groups/")
    assert response.status_code in [200, 401]

def test_trust_score_breakdown_endpoint():
    response = client.get("/api/v1/users/me/trust-score/breakdown")
    assert response.status_code in [200, 401]

def test_voice_simulator_endpoint():
    payload = {"speech_text": "Mera trust score kitna hai?", "language": "hi"}
    response = client.post("/api/v1/voice/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prompt_text" in data

