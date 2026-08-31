# ChitTrust + CashBridge 🪙🤝

> **Financial Inclusion Platform for Mixed Digital + Cash-Based Community Committees (Chit Funds / SHGs) in India**

---

## 📌 Project Overview

**ChitTrust + CashBridge** is a hackathon-ready financial inclusion platform built specifically for informal and semi-formal community savings groups (Chit Funds, ROSCAs, Self-Help Groups) across urban and rural India.

It bridges the gap between **digital-first members** (who prefer UPI/online payments) and **cash-based micro-savers** (who lack digital literacy or banking access), creating a **unified Trust Score** that treats digital and verified cash contributions with equal credit weight.

---

## 🤖 AI Trust Intelligence, Fraud Detection & Predictive Risk Engine (Phase 12 Completed)

For complete AI architecture, 7-rule hybrid scoring formulas, safety guardrails, and evaluation matrices, see [docs/ai-architecture.md](file:///c:/Users/sapna%20jha/ChitTrust%20—%20CashBridge/docs/ai-architecture.md) and [docs/ai-risk-model.md](file:///c:/Users/sapna%20jha/ChitTrust%20—%20CashBridge/docs/ai-risk-model.md).

- **Strict 3-Concept Separation**:
  - **Trust Score**: Behavioral reliability index (Base 100+).
  - **Risk Score**: Operational anomaly review signal (0–100: Very Low, Low, Moderate, High, Critical).
  - **AI Confidence**: Statistical model confidence (e.g., 86%).
- **Human-in-the-Loop Governance**: AI risk flags are titled **"Needs Review"** (never "Fraud"). The AI is **never** the final decision-maker, and AI risk assessments **NEVER automatically modify or degrade a member's Trust Score**.
- **Ask ChitTrust AI Assistant**: Interactive conversational assistant widget (`AskChitTrustWidget`) answering financial questions in Hindi and English using authorized database context.
- **Natural Language Score Explanations ("Mera Trust Score kyun badha?")**: Generates clear score summaries based strictly on historical `trust_score_events`.
- **Dedicated AI Risk Review Portal (`/risk-review`)**: Displays 0–100 Risk Scores, statistical confidence metrics (86%), baseline timeline metrics, and human resolution controls.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State & Auth**: Supabase Auth + React Auth Context (`useAuth`)
- **Payments & AI**: Razorpay Checkout SDK (Test Mode) + Mobile Camera Capture + Voice IVR Simulator + Ask ChitTrust AI Widget
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend & Database
- **Framework**: FastAPI (Python 3.11+)
- **AI Intelligence**: Hybrid Rule Engine + Provider Abstraction (Mock & Groq) + Feature Engine
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
- [x] **Phase 11: Production Hardening, Security, Compliance & Final Polish** (Security Audit, RLS Verification, Rate Limiting, Privacy/Terms Pages, Demo Mode)
- [x] **Phase 12: AI Trust Intelligence, Fraud Detection & Predictive Risk Engine** (0-100 Risk Scoring, AI Assistant, Hindi Explanations, Human Review Portal, Safety Guardrails)

---

## ⚖️ Legal & Compliance Disclaimer

> [!IMPORTANT]
> **Hackathon MVP Notice**: Real-world deployment requires formal compliance under India's **Chit Funds Act, 1982** and applicable state amendments.
