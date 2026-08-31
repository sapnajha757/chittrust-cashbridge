# ChitTrust + CashBridge 🪙🤝

> **Financial Inclusion Platform for Mixed Digital + Cash-Based Community Committees (Chit Funds / SHGs) in India**

---

## 📌 Project Overview

**ChitTrust + CashBridge** is a hackathon-ready financial inclusion platform built specifically for informal and semi-formal community savings groups (Chit Funds, ROSCAs, Self-Help Groups) across urban and rural India.

It bridges the gap between **digital-first members** (who prefer UPI/online payments) and **cash-based micro-savers** (who lack digital literacy or banking access), creating a **unified Trust Score** that treats digital and verified cash contributions with equal credit weight.

---

## 📊 Analytics, Notifications & Risk Intelligence (Phase 10 Completed)

For complete analytics formulas, 7-rule risk engine specs, and resolution audit workflows, see [docs/analytics_risk.md](file:///c:/Users/sapna%20jha/ChitTrust%20—%20CashBridge/docs/analytics_risk.md).

- **Dynamic Platform & Group KPIs**: Calculates Collection Rate (%), On-Time Rate (%), Cash vs Digital percentages, and aggregate Trust Scores dynamically from source-of-truth tables.
- **Explainable Operational Risk Engine (`RiskEngine`)**: Evaluates 7 operational anomaly rules (`UNUSUAL_VOLUME`, `REPEATED_PATTERN`, `POSSIBLE_DUPLICATE`, `MISSING_PROOF`, `PAYMENT_BEHAVIOR_REVIEW`, `PAYOUT_AMOUNT_MISMATCH`, `STATE_CHANGE_VIOLATION`) with 0-100 Risk Scoring (Low, Medium, High, Critical).
- **Needs Review Wording & Trust Separation**: Risk flags are titled "Needs Review" and **NEVER automatically modify a member's Trust Score**.
- **Multi-Channel Notification System**: In-app Notification Center (`/notifications`) with read toggles and automated triggers for payments, auctions, payouts, and risk alerts.
- **Dedicated Risk & Agent Monitoring Portals**: `/risk` portal for evidence review and resolution audit notes; `/dashboard/agents` portal for agent performance tracking.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State & Auth**: Supabase Auth + React Auth Context (`useAuth`)
- **Payments**: Razorpay Checkout SDK (Test Mode) + Mobile Camera Capture + Voice IVR Simulator
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend & Database
- **Framework**: FastAPI (Python 3.11+)
- **Payments SDK**: Razorpay Python SDK (`razorpay`)
- **Telephony & Notifications**: Telephony Abstraction (Mock, Twilio, Exotel) + In-App Notifications
- **Database**: Supabase PostgreSQL + Auth + Storage
- **Security**: Row Level Security (RLS) & Pgcrypto

---

## ⚡ Quick Start & App Setup Instructions

### 1. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
Available at `http://localhost:3000`.

### 2. Backend Setup

```bash
cd backend

# Activate virtual environment (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Run FastAPI backend server
python run.py
```
Available at `http://localhost:8000`.

---

## 📈 Development Roadmap & Completed Phases

- [x] **Phase 1: Project Foundation** (Tech Stack, Modular Layout, Routing, Health Check, Types, Documentation)
- [x] **Phase 2: Database Schemas, RLS Security, Triggers & Storage** (10 Tables, 9 Enums, Triggers, RLS, Storage Bucket)
- [x] **Phase 3: Authentication, Onboarding & Role-Based Access** (Phone OTP, Profile Setup, Middleware, Dashboards)
- [x] **Phase 4: Group Creation & Membership Management** (Group Setup, Digital/Cash Invites, Agent Assignment, Exited State)
- [x] **Phase 5: Digital Contributions & Razorpay Test Payments** (Razorpay Test Mode, HMAC-SHA256 Verification, Webhook Idempotency, Receipts)
- [x] **Phase 6: CashBridge Doorstep Cash Verification Workflows** (Mobile-first Agent App, Photo Proof Capture, Private Storage, Notifications)
- [x] **Phase 7: Explainable TrustScore Calculation Engine** (Equal Credit Weight, Deterministic Points, Audit Ledger, Timeline UI)
- [x] **Phase 8: Multilingual Voice IVR & Hindi Trust Score Subsystem** (Feature Phone Telephony, Hindi Voice Prompts, Provider Abstraction, Voice Simulator)
- [x] **Phase 9: Monthly Auction & Payout Engine** (Bid Auctions, Lucky Draws, Net Payout Calculation, Doorstep Cash Payouts, Audit Trail)
- [x] **Phase 10: Analytics, Notifications & Risk Intelligence Subsystem** (Platform KPIs, Collection Rates, 7-Rule Risk Engine, Flag Resolutions, In-App Notifications)

---

## ⚖️ Legal & Compliance Disclaimer

> [!IMPORTANT]
> **Hackathon MVP Notice**: Real-world deployment requires formal compliance under India's **Chit Funds Act, 1982** and applicable state amendments.
