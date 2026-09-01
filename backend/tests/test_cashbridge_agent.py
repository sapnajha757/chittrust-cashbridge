import pytest
from app.services.agent_service import AgentService
from app.core.exceptions import APIException

def test_record_cash_contribution():
    res = AgentService.record_cash_contribution(
        agent_id="00000000-0000-0000-0000-000000000002",
        membership_id="m_test_cash_99",
        amount=2500.0,
        month_number=5,
        photo_proof_url="https://example.com/proof.jpg"
    )
    assert res["success"] is True
    assert res["amount"] == 2500.0
    assert res["mode"] == "cash"

def test_invalid_cash_amount():
    with pytest.raises(APIException):
        AgentService.record_cash_contribution(
            agent_id="00000000-0000-0000-0000-000000000002",
            membership_id="m_test_cash_100",
            amount=5000.0, # Expected 2500.0
            month_number=6,
            photo_proof_url="https://example.com/proof.jpg"
        )
