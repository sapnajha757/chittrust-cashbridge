import pytest
from app.services.razorpay_service import RazorpayService
from app.services.contribution_service import ContributionService

def test_razorpay_paise_conversion():
    order = RazorpayService.create_order(2500.0, "rcpt_123", {"test": True})
    assert order["amount"] == 250000 # 2500 * 100 paise

def test_webhook_idempotency():
    res1 = ContributionService.process_webhook("evt_1001", "payment.captured", {})
    assert res1["status"] == "success"
    
    res2 = ContributionService.process_webhook("evt_1001", "payment.captured", {})
    assert res2["status"] == "already_processed"
