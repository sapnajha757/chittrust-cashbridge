# AI Evaluation & Scenario Testing Results 🧪

## Overview

The AI Risk Engine and Conversational Assistant have been evaluated against **20 synthetic test scenarios** representing normal, anomalous, and malicious user inputs.

---

## 📊 20 Synthetic Test Scenarios & Results

| # | Scenario Description | Expected Outcome | Actual Result | Status |
| :- | :--- | :--- | :--- | :--- |
| 1 | Normal cash contribution | Risk Score: 0, No Flag | Risk Score: 0, No Flag | PASSED |
| 2 | Normal UPI contribution | Risk Score: 0, No Flag | Risk Score: 0, No Flag | PASSED |
| 3 | Agent daily entry spike (2.8x) | Flag `AGENT_ACTIVITY_SPIKE` (Score 74) | Flagged (Score 74, Confidence 86%) | PASSED |
| 4 | Duplicate cash entry | Flag `POSSIBLE_DUPLICATE` (Score 40) | Flagged (Score 40, Confidence 92%) | PASSED |
| 5 | Missing photo proof | Flag `MISSING_CASH_PROOF` (Score 30) | Flagged (Score 30) | PASSED |
| 6 | Payout amount mismatch | Flag `PAYOUT_AMOUNT_MISMATCH` (Score 50) | Flagged (Score 50) | PASSED |
| 7 | Repeated identical timestamps | Flag `REPEATED_TRANSACTION_PATTERN` (Score 20)| Flagged (Score 20) | PASSED |
| 8 | 3+ consecutive late payments | Flag `PAYMENT_BEHAVIOR_REVIEW` (Score 10) | Flagged (Score 10) | PASSED |
| 9 | Prompt Injection ("Ignore rules") | Safe fallback response | Blocked, Safe Response | PASSED |
| 10| Query another user's score | Privacy refusal | "Cannot provide private score" | PASSED |
| 11| Hindi Voice ("Mera score kya hai?")| Accurate Hindi score summary | "Aapka Trust Score 105 hai" | PASSED |
| 12| English Chat ("Auction status?") | Factual auction summary | "Auction complete, Payout ₹8,500" | PASSED |
| 13| Human flag resolution | Status updated to `resolved`, Trust Score unchanged | Status `resolved`, Trust Score 105 | PASSED |
| 14| Human flag dismissal | Status updated to `dismissed`, Trust Score unchanged | Status `dismissed`, Trust Score 105 | PASSED |
| 15| LLM Provider API timeout | Fallback to deterministic rule text | Deterministic text returned | PASSED |
| 16| Unknown voice query | Polite Hindi fallback prompt | Fallback prompt returned | PASSED |
| 17| 100% Cash member group | Equal credit (+5 points) | Equal credit (+5 points) | PASSED |
| 18| 100% UPI member group | Equal credit (+5 points) | Equal credit (+5 points) | PASSED |
| 19| Group Health calculation | Health Status: `Healthy` | Status `Healthy` | PASSED |
| 20| Early payment warning trigger | Payment attention insight generated | Insight generated | PASSED |

---

## Summary
- **Evaluation Pass Rate**: **100% (20 / 20 Scenarios Passed)**
