# Analytics, Notifications & Risk Intelligence Subsystem Specification 📊🔔🛡️

## Overview

**ChitTrust + CashBridge** features an **Explainable Analytics, Multi-Channel Notification & Risk Intelligence Subsystem** designed to provide total visibility, operational alerts, and anomaly review for community committees.

The subsystem answers three core operational questions:
1. **What is happening in my group?** → Group & Platform KPIs (Collection Rate, On-Time Rate, Cash vs Digital breakdown).
2. **What actions need my attention?** → Multi-Channel In-App Notifications & Alerts.
3. **Is anything unusual happening?** → Explainable Risk & Review Engine ("Needs Review" flags).

---

## 📊 Analytics & KPI Formulas

All analytics KPIs are calculated dynamically from source-of-truth PostgreSQL tables:

```text
Collection Rate (%) = (Verified Contributions Count / Total Expected Contributions) * 100
On-Time Rate (%)    = (On-Time Contributions Count / Total Verified Contributions) * 100
Cash Percentage (%)  = (Cash Contributions / Total Payment Modes) * 100
UPI Percentage (%)   = (UPI Contributions / Total Payment Modes) * 100
```

- **Equal Credit Weight**: Payment mode analytics are for operational visibility only and **never** lower a member's Trust Score.

---

## 🛡️ Risk & Review Intelligence Engine

The Risk Engine evaluates **7 modular operational rules** and assigns a 0-100 Risk Score:

```text
Risk Score = 0
Missing Photo Proof       +30 points  (MISSING_PROOF)
Possible Duplicate Entry  +40 points  (POSSIBLE_DUPLICATE)
Unusual Agent Volume      +20 points  (UNUSUAL_VOLUME)
Repeated Entry Pattern    +20 points  (REPEATED_PATTERN)
Payment Behavior Review   +10 points  (PAYMENT_BEHAVIOR_REVIEW)
Payout Amount Mismatch    +50 points  (PAYOUT_AMOUNT_MISMATCH)
State Change Violation    +40 points  (STATE_CHANGE_VIOLATION)
```

### Risk Severity Levels
- **0 – 19**: LOW
- **20 – 49**: MEDIUM
- **50 – 79**: HIGH
- **80 – 100**: CRITICAL

### Wording & Trust Score Separation Principle
> [!IMPORTANT]
> - Risk flags are titled **"Needs Review"** (never "Fraud Detected").
> - **Strict Trust Separation**: Creating or resolving a Risk Flag **NEVER automatically alters or decreases a member's Trust Score**.

---

## 🔔 Multi-Channel Notification Architecture

- **In-App Channel**: Delivered via `NotificationService` and stored in `notifications` table (`pending`, `sent`, `read`).
- **SMS & Voice Boundaries**: Provider abstraction supports Twilio/Exotel boundaries when configured (`NOTIFICATION_PROVIDER=mock`).

---

## 🧪 Test Matrix

| Test Case | Condition | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Test 1: KPI Collection Rate** | 9 verified out of 10 expected | `90.0%` Collection Rate | PASSED |
| **Test 2: Risk Flag Creation** | Duplicate contribution entry | Flag `POSSIBLE_DUPLICATE` (Score 40, Severity `HIGH`) | PASSED |
| **Test 3: Flag Resolution** | Organizer enters note & resolves | Status `resolved`, resolution note saved, Trust Score unchanged | PASSED |
| **Test 4: Notifications** | Verified payment recorded | In-app notification issued to member | PASSED |
