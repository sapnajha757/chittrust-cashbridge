import pytest
from app.services.trust_score_service import TrustScoreService

def test_base_score():
    snapshot, events = TrustScoreService.calculate_pure_trust_score([])
    assert snapshot["score"] == 100
    assert snapshot["current_streak"] == 0
    assert len(events) == 0

def test_on_time_contributions_and_streak():
    contribs = [
        {"id": "c1", "month_number": 1, "status": "successful", "paid_on_time": True, "mode": "upi"},
        {"id": "c2", "month_number": 2, "status": "successful", "paid_on_time": True, "mode": "cash"},
        {"id": "c3", "month_number": 3, "status": "successful", "paid_on_time": True, "mode": "upi"},
    ]
    snapshot, events = TrustScoreService.calculate_pure_trust_score(contribs)
    # Month 1 (+5) -> 105
    # Month 2 (+5) -> 110
    # Month 3 (+5) -> 115 + Bonus (+10) -> 125
    assert snapshot["score"] == 125
    assert snapshot["total_on_time"] == 3
    assert snapshot["current_streak"] == 3
    assert snapshot["total_bonus_points"] == 10
    assert len(events) == 4 # 3 on-time events + 1 streak bonus event

def test_late_and_missed_contributions():
    contribs = [
        {"id": "c1", "month_number": 1, "status": "successful", "paid_on_time": True}, # +5 -> 105
        {"id": "c2", "month_number": 2, "status": "successful", "paid_on_time": False, "days_late": 4}, # -5 -> 100, streak=0
        {"id": "c3", "month_number": 3, "status": "successful", "paid_on_time": False, "days_late": 10}, # -10 -> 90
        {"id": "c4", "month_number": 4, "status": "missed"}, # -20 -> 70
    ]
    snapshot, events = TrustScoreService.calculate_pure_trust_score(contribs)
    assert snapshot["score"] == 70
    assert snapshot["total_on_time"] == 1
    assert snapshot["total_late_within_7_days"] == 1
    assert snapshot["total_late_over_7_days"] == 1
    assert snapshot["total_missed"] == 1
    assert snapshot["current_streak"] == 0

def test_equal_weight_cash_and_upi():
    contrib_upi = [{"id": "c1", "month_number": 1, "status": "successful", "paid_on_time": True, "mode": "upi"}]
    contrib_cash = [{"id": "c2", "month_number": 1, "status": "successful", "paid_on_time": True, "mode": "cash"}]
    snap_upi, _ = TrustScoreService.calculate_pure_trust_score(contrib_upi)
    snap_cash, _ = TrustScoreService.calculate_pure_trust_score(contrib_cash)
    assert snap_upi["score"] == snap_cash["score"] == 105
