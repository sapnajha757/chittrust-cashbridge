# AI Risk & Anomaly Scoring Model 🧮

## Overview

The AI Risk Engine calculates a normalized **0–100 Operational Risk Score** by combining 7 deterministic ledger rules with statistical baseline deviation tracking.

---

## 📏 7 Hybrid Operational Rules & Weights

```text
Rule 1: DUPLICATE_CONTRIBUTION     (+40 points) -> Matching member, month, and amount entry.
Rule 2: AGENT_ACTIVITY_SPIKE       (+20 points) -> Cash entries > 2.0x daily baseline.
Rule 3: REPEATED_TRANSACTION_PATTERN (+20 points) -> Identical transactions within short timestamps.
Rule 4: MISSING_CASH_PROOF         (+30 points) -> Unverified cash contribution without photo proof.
Rule 5: UNUSUAL_TRANSACTION_TIME   (+15 points) -> High volume entries during unusual hours.
Rule 6: PAYMENT_BEHAVIOR_REVIEW    (+10 points) -> 3+ consecutive late payment entries.
Rule 7: PAYOUT_AMOUNT_MISMATCH     (+50 points) -> Payout amount does not match (Pot - Discount).
```

### Risk Level Interpretation
- **0 – 20**: Very Low
- **21 – 40**: Low
- **41 – 60**: Moderate
- **61 – 80**: High
- **81 – 100**: Critical

---

## 🎯 Confidence Index Formula

$$\text{Confidence} = 1.00 - \left( 0.05 \times \text{Missing Feature Ratio} \right)$$

- Base Confidence = **0.95** (95%) for complete structured ledger inputs.
