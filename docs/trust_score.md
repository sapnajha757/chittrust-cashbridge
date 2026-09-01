# Explainable Trust Score Engine Specification 📈⚖️

## Overview

**ChitTrust + CashBridge** features an **auditable, deterministic Credit Trust Score Engine** designed to record and quantify community contribution reliability.

The core product principle dictates that **Cash and Digital (UPI) contributions receive equal credit weight**. A user is never penalized or given a lower score merely because they contribute via doorstep cash.

---

## 🧮 Core Scoring Rules & Mathematical Formula

```text
Base Starting Score: 100
Floor Limit: 0
Ceiling Limit: 1000

On-Time Contribution (Cash or UPI):     +5 points
Late Contribution (≤ 7 days):           -5 points
Late Contribution (> 7 days):           -10 points
Missed Payment:                         -20 points
3-Month Consecutive Streak Milestone:   +10 bonus points
```

---

## ⚖️ Equal Credit Weight Matrix

| Payment Mode | On-Time Credit | Late (≤7d) Penalty | Late (>7d) Penalty | Streak Bonus |
| :--- | :--- | :--- | :--- | :--- |
| **UPI / Online** | `+5` points | `-5` points | `-10` points | `+10` points |
| **Doorstep Cash (CashBridge)** | `+5` points | `-5` points | `-10` points | `+10` points |

---

## 📜 Audit Ledger Table (`trust_score_events`)

```sql
CREATE TABLE trust_score_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contribution_id UUID NULL REFERENCES contributions(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    points INTEGER NOT NULL,
    streak_before INTEGER DEFAULT 0,
    streak_after INTEGER DEFAULT 0,
    score_before INTEGER DEFAULT 100,
    score_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_event_type CHECK (event_type IN ('on_time', 'late_within_7_days', 'late_over_7_days', 'missed', 'streak_bonus')),
    CONSTRAINT uq_user_contribution_event UNIQUE (user_id, contribution_id, event_type)
);
```

---

## 🧪 Scoring Test Cases

| Scenario | Calculation Breakdown | Expected Score |
| :--- | :--- | :--- |
| **Test 1: New Account** | `100 (Base)` | **100** |
| **Test 2: 1 On-Time Payment** | `100 + 5` | **105** |
| **Test 3: 3 On-Time Payments (Streak)** | `100 + (3 × 5) + 10 (Streak Bonus)` | **125** |
| **Test 4: 3 On-Time + Late (≤7d)** | `125 - 5` | **120** |
| **Test 5: 3 On-Time + Late (>7d)** | `125 - 10` | **115** |
| **Test 6: 3 On-Time + Missed Payment** | `125 - 20` | **105** |
| **Test 7: 1 On-Time Cash Payment** | `100 + 5` | **105** |
| **Test 8: 1 On-Time UPI Payment** | `100 + 5` | **105** |

---

## ⚖️ Legal Disclaimer

> [!NOTE]
> Trust Score reflects contribution consistency within ChitTrust. It is not a bank credit score (such as CIBIL) or guarantee of formal creditworthiness.
