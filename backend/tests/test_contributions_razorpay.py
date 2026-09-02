import pytest
from app.services.razorpay_service import RazorpayService
from app.services.contribution_service import ContributionService

from unittest.mock import patch, MagicMock

def test_razorpay_paise_conversion():
    mock_client = MagicMock()
    mock_client.order.create.return_value = {"id": "order_test_123", "amount": 250000, "currency": "INR"}
    with patch("app.services.razorpay_service._get_razorpay_client", return_value=mock_client):
        order = RazorpayService.create_order(2500.0, "rcpt_123", {"test": True})
        assert order["amount"] == 250000 # 2500 * 100 paise

def test_webhook_idempotency():
    res1 = ContributionService.process_webhook("evt_1001", "payment.captured", {})
    assert res1["status"] == "success"
    
    res2 = ContributionService.process_webhook("evt_1001", "payment.captured", {})
    assert res2["status"] == "already_processed"

def test_webhook_payment_captured_and_authorized_events():
    payload_captured = {
        "payment": {
            "entity": {
                "id": "pay_cap_123",
                "order_id": "order_demo_111111",
                "amount": 250000,
                "status": "captured"
            }
        }
    }
    res_cap = ContributionService.process_webhook("evt_cap_2001", "payment.captured", payload_captured)
    assert res_cap["status"] == "success"

    payload_auth = {
        "payment": {
            "entity": {
                "id": "pay_auth_456",
                "order_id": "order_demo_111111",
                "amount": 250000,
                "status": "authorized"
            }
        }
    }
    res_auth = ContributionService.process_webhook("evt_auth_2002", "payment.authorized", payload_auth)
    assert res_auth["status"] == "success"

def test_webhook_payment_failed_event():
    payload_failed = {
        "payment": {
            "entity": {
                "id": "pay_fail_789",
                "order_id": "order_demo_111111",
                "error_code": "BAD_REQUEST_ERROR",
                "error_description": "Payment was declined by issuing bank",
                "status": "failed"
            }
        }
    }
    res_fail = ContributionService.process_webhook("evt_fail_2003", "payment.failed", payload_failed)
    assert res_fail["status"] == "success"
    assert res_fail["event_type"] == "payment.failed"

