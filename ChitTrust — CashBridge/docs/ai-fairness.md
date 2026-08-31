# AI Fairness & Equal Credit Review ⚖️

## Overview

ChitTrust's core mission is financial inclusion for cash-based micro-savers. The AI Intelligence Layer enforces strict fairness principles across payment methods and user roles.

---

## 🛡️ Fairness Guarantees

1. **Equal Credit Weight**:
   - On-time cash contributions verified by CashBridge Agents receive identical Trust Score points (+5) as digital Razorpay UPI payments.
   - Payment method (Cash vs Digital) is **never** an input feature for Risk Engine penalties.

2. **Agent Neutrality**:
   - CashBridge Agents handling large cash volumes are **not** penalized simply due to high transaction volume. Spikes are evaluated only against an agent's individual historical baseline.

3. **No Automatic Fraud Accusations**:
   - Risk signals are titled **"Needs Review"** (never "Fraud").
   - Review flags require human-in-the-loop verification by committee organizers.
