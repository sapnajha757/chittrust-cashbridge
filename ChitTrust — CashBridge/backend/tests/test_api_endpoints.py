import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "environment" in data

def test_get_groups():
    response = client.get("/api/v1/groups/")
    assert response.status_code == 200
    groups = response.json()
    assert isinstance(groups, list)

def test_trust_score_breakdown_endpoint():
    response = client.get("/api/v1/users/me/trust-score/breakdown")
    assert response.status_code == 200
    data = response.json()
    assert data["score"] >= 0
    assert "breakdown_items" in data

def test_voice_simulator_endpoint():
    payload = {"speech_text": "Mera trust score kitna hai?", "language": "hi"}
    response = client.post("/api/v1/voice/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prompt_text" in data
    assert "Trust Score" in data["prompt_text"] or "105" in data["prompt_text"] or "100" in data["prompt_text"]
