import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Tuple
from app.core.exceptions import APIException

logger = logging.getLogger("chittrust.trust_score")

# Scoring System Constants
BASE_SCORE = 100
MIN_SCORE = 0
MAX_SCORE = 1000
ON_TIME_POINTS = 5
LATE_7_POINTS = -5
LATE_OVER_7_POINTS = -10
MISSED_POINTS = -20
STREAK_BONUS = 10
STREAK_THRESHOLD = 3

# Local storage for trust score events and snapshots
DEMO_TRUST_EVENTS: List[Dict[str, Any]] = [
    {
        "id": "te111111-1111-1111-1111-111111111111",
        "user_id": "00000000-0000-0000-0000-000000000003",
        "contribution_id": "c1111111-1111-1111-1111-111111111111",
        "month_number": 1,
        "payment_mode": "upi",
        "event_type": "on_time",
        "points": 5,
        "streak_before": 0,
        "streak_after": 1,
        "score_before": 100,
        "score_after": 105,
        "reason": "On-time contribution for Month 1 (+5)",
        "created_at": datetime.utcnow().isoformat(),
    }
]

DEMO_TRUST_SNAPSHOTS: Dict[str, Dict[str, Any]] = {
    "00000000-0000-0000-0000-000000000003": {
        "user_id": "00000000-0000-0000-0000-000000000003",
        "score": 105,
        "base_score": 100,
        "total_on_time": 1,
        "total_late": 0,
        "total_late_within_7_days": 0,
        "total_late_over_7_days": 0,
        "total_missed": 0,
        "current_streak": 1,
        "total_bonus_points": 0,
        "version": 1,
        "last_updated": datetime.utcnow().isoformat(),
    }
}


class TrustScoreService:
    @staticmethod
    def calculate_pure_trust_score(contributions: List[Dict[str, Any]]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Pure, deterministic trust score calculation engine.
        Processes contribution history chronologically and evaluates points, streaks, and bonuses.
        Cash and Digital payment modes receive IDENTICAL point credit weight.
        """
        # Sort contributions chronologically by month_number / payment_date
        sorted_contribs = sorted(
            contributions,
            key=lambda c: (c.get("month_number", 0), c.get("payment_date") or c.get("created_at") or "")
        )

        current_score = BASE_SCORE
        current_streak = 0
        total_on_time = 0
        total_late_7 = 0
        total_late_over_7 = 0
        total_missed = 0
        total_bonus_points = 0

        events_generated = []

        for contrib in sorted_contribs:
            status = contrib.get("payment_status") or contrib.get("status")
            if status != "successful":
                # Pending payments do not affect score yet
                continue

            score_before = current_score
            streak_before = current_streak
            month_num = contrib.get("month_number", 1)
            mode = contrib.get("mode") or contrib.get("payment_mode") or "upi"
            contrib_id = contrib.get("id")

            paid_on_time = contrib.get("paid_on_time", True)

            if paid_on_time:
                points = ON_TIME_POINTS
                event_type = "on_time"
                total_on_time += 1
                current_streak += 1
                reason = f"On-time contribution ({mode.upper()}) for Month {month_num} (+{ON_TIME_POINTS})"

                current_score = max(MIN_SCORE, min(MAX_SCORE, current_score + points))

                events_generated.append({
                    "id": str(uuid.uuid4()),
                    "user_id": contrib.get("user_id", "demo_user"),
                    "contribution_id": contrib_id,
                    "month_number": month_num,
                    "payment_mode": mode,
                    "event_type": event_type,
                    "points": points,
                    "streak_before": streak_before,
                    "streak_after": current_streak,
                    "score_before": score_before,
                    "score_after": current_score,
                    "reason": reason,
                    "created_at": contrib.get("payment_date") or datetime.utcnow().isoformat(),
                })

                # Check for 3-month streak bonus milestone
                if current_streak == STREAK_THRESHOLD:
                    streak_score_before = current_score
                    streak_points = STREAK_BONUS
                    total_bonus_points += streak_points
                    current_score = max(MIN_SCORE, min(MAX_SCORE, current_score + streak_points))

                    events_generated.append({
                        "id": str(uuid.uuid4()),
                        "user_id": contrib.get("user_id", "demo_user"),
                        "contribution_id": contrib_id,
                        "month_number": month_num,
                        "payment_mode": mode,
                        "event_type": "streak_bonus",
                        "points": streak_points,
                        "streak_before": current_streak,
                        "streak_after": current_streak,
                        "score_before": streak_score_before,
                        "score_after": current_score,
                        "reason": f"3-Month Consecutive On-Time Consistency Bonus (+{STREAK_BONUS})",
                        "created_at": contrib.get("payment_date") or datetime.utcnow().isoformat(),
                    })
            else:
                # Late payment classification
                days_late = contrib.get("days_late", 3)
                current_streak = 0  # Reset streak on late payment

                if days_late <= 7:
                    points = LATE_7_POINTS
                    event_type = "late_within_7_days"
                    total_late_7 += 1
                    reason = f"Late contribution (≤ 7 days) for Month {month_num} ({LATE_7_POINTS})"
                else:
                    points = LATE_OVER_7_POINTS
                    event_type = "late_over_7_days"
                    total_late_over_7 += 1
                    reason = f"Late contribution (> 7 days) for Month {month_num} ({LATE_OVER_7_POINTS})"

                current_score = max(MIN_SCORE, min(MAX_SCORE, current_score + points))

                events_generated.append({
                    "id": str(uuid.uuid4()),
                    "user_id": contrib.get("user_id", "demo_user"),
                    "contribution_id": contrib_id,
                    "month_number": month_num,
                    "payment_mode": mode,
                    "event_type": event_type,
                    "points": points,
                    "streak_before": streak_before,
                    "streak_after": 0,
                    "score_before": score_before,
                    "score_after": current_score,
                    "reason": reason,
                    "created_at": contrib.get("payment_date") or datetime.utcnow().isoformat(),
                })

        snapshot = {
            "score": current_score,
            "base_score": BASE_SCORE,
            "total_on_time": total_on_time,
            "total_late": total_late_7 + total_late_over_7,
            "total_late_within_7_days": total_late_7,
            "total_late_over_7_days": total_late_over_7,
            "total_missed": total_missed,
            "current_streak": current_streak,
            "total_bonus_points": total_bonus_points,
            "version": 1,
            "last_updated": datetime.utcnow().isoformat(),
        }

        return snapshot, events_generated

    @classmethod
    def get_user_trust_score(cls, user_id: str) -> Dict[str, Any]:
        """
        Retrieves user trust score snapshot.
        """
        snapshot = DEMO_TRUST_SNAPSHOTS.get(user_id)
        if not snapshot:
            snapshot = {
                "user_id": user_id,
                "score": 100,
                "base_score": 100,
                "total_on_time": 0,
                "total_late": 0,
                "total_late_within_7_days": 0,
                "total_late_over_7_days": 0,
                "total_missed": 0,
                "current_streak": 0,
                "total_bonus_points": 0,
                "version": 1,
                "last_updated": datetime.utcnow().isoformat(),
            }
            DEMO_TRUST_SNAPSHOTS[user_id] = snapshot
        return snapshot

    @classmethod
    def get_user_score_history(cls, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves chronological trust score event timeline.
        """
        return [e for e in DEMO_TRUST_EVENTS if e.get("user_id") == user_id]

    @classmethod
    def get_user_score_breakdown(cls, user_id: str) -> Dict[str, Any]:
        """
        Generates itemized point breakdown.
        """
        snapshot = cls.get_user_trust_score(user_id)

        on_time_pts = snapshot["total_on_time"] * ON_TIME_POINTS
        late_7_pts = snapshot["total_late_within_7_days"] * LATE_7_POINTS
        late_over_7_pts = snapshot["total_late_over_7_days"] * LATE_OVER_7_POINTS
        missed_pts = snapshot["total_missed"] * MISSED_POINTS
        bonus_pts = snapshot["total_bonus_points"]

        breakdown_items = [
            {
                "label": "Base Starting Score",
                "count": 1,
                "points_per_unit": BASE_SCORE,
                "total_points": BASE_SCORE,
            },
            {
                "label": "On-Time Contributions (UPI + Cash)",
                "count": snapshot["total_on_time"],
                "points_per_unit": ON_TIME_POINTS,
                "total_points": on_time_pts,
            },
            {
                "label": "Late Contributions (≤ 7 days)",
                "count": snapshot["total_late_within_7_days"],
                "points_per_unit": LATE_7_POINTS,
                "total_points": late_7_pts,
            },
            {
                "label": "Late Contributions (> 7 days)",
                "count": snapshot["total_late_over_7_days"],
                "points_per_unit": LATE_OVER_7_POINTS,
                "total_points": late_over_7_pts,
            },
            {
                "label": "Missed Payments",
                "count": snapshot["total_missed"],
                "points_per_unit": MISSED_POINTS,
                "total_points": missed_pts,
            },
            {
                "label": "3-Month Consistency Streak Bonuses",
                "count": snapshot["total_bonus_points"] // STREAK_BONUS if STREAK_BONUS > 0 else 0,
                "points_per_unit": STREAK_BONUS,
                "total_points": bonus_pts,
            },
        ]

        return {
            "user_id": user_id,
            "score": snapshot["score"],
            "base_score": BASE_SCORE,
            "on_time_contribution_points": on_time_pts,
            "late_within_7_days_penalties": late_7_pts,
            "late_over_7_days_penalties": late_over_7_pts,
            "missed_payment_penalties": missed_pts,
            "consistency_streak_bonuses": bonus_pts,
            "breakdown_items": breakdown_items,
        }

trust_score_service = TrustScoreService()
