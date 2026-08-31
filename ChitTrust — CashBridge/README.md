# ChitTrust + CashBridge 🪙🤝

> **Financial Inclusion Platform for Mixed Digital + Cash-Based Community Committees (Chit Funds / SHGs) in India**

---

## 📌 Project Overview

**ChitTrust + CashBridge** is a hackathon-ready financial inclusion platform built specifically for informal and semi-formal community savings groups (Chit Funds, ROSCAs, Self-Help Groups) across urban and rural India.

It bridges the gap between **digital-first members** (who prefer UPI/online payments) and **cash-based micro-savers** (who lack digital literacy or banking access), creating a **unified Trust Score** that treats digital and verified cash contributions with equal credit weight.

---

## 🚀 Key Features & Highlights

- **Mixed Digital + Doorstep Cash Ledger**: Seamlessly integrates Razorpay UPI Test Mode payments and CashBridge Agent doorstep cash collection with mandatory photo proof.
- **Equal Credit Weight Trust Score Engine**: Math-based Trust Score (Base 100+) giving identical credit weight (+5 points) to cash and digital payments.
- **Monthly Auction & Payout Engine**: Bid auctions (highest valid discount wins) and lucky draws with exact fixed-point `Decimal` payout calculations.
- **Feature Phone Multilingual Voice IVR**: Feature phone simulator (`/dev/voice-demo`) supporting natural Hindi voice queries (*"Mera Trust Score kya hai?"*).
- **AI Trust Intelligence & Risk Engine**: 7-rule hybrid operational risk evaluator with 0–100 Risk Scores, 86% AI confidence index, and human-in-the-loop review portal (`/risk-review`).
- **Ask ChitTrust Conversational AI Widget**: Interactive chat assistant answering financial questions in Hindi/English using authorized database context.
- **Production Hardened & Audited**: 27 PostgreSQL migration files, 21 RLS security policies, security headers, rate limiting, and zero committed secrets.

---

## 🛠️ Tech Stack & Integrations

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State & Auth**: Supabase Auth + React Auth Context (`useAuth`)
- **Payments & AI**: Razorpay Checkout SDK (Test Mode) + Mobile Camera Capture + Voice Simulator + Ask ChitTrust AI Widget
- **Styling**: Tailwind CSS & Lucide React

### Backend & Database
- **Framework**: FastAPI (Python 3.11+)
- **Database**: Supabase PostgreSQL (21 RLS-Enabled Tables)
- **AI Intelligence**: Hybrid Rule Engine + Groq LLM API Integration (`gsk_...`)
- **Telephony & Voice**: Telephony Abstraction (Twilio Telephony & Mock Provider)
- **Security**: Row Level Security (RLS), Pgcrypto, Security Headers, SlowAPI Rate-Limiting

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
Available at `http://localhost:8000` (API Docs at `http://localhost:8000/api/v1/docs`).

---

## 📋 Environment Configuration Template (`.env.example`)

Refer to [.env.example](file:///c:/Users/sapna%20jha/ChitTrust%20—%20CashBridge/.env.example) for template variable placeholders.

- **Supabase Project**: Configured for project `ssishktinopnepbydsgh`.
- **Razorpay Test Mode**: Active Key ID `rzp_test_TWRGglD9NiPvbo`.
- **Groq LLM**: Active LLM Key (`gsk_...`).
- **Twilio Voice IVR**: Active Account SID `AC9bdd32a...`.

---

## 📈 Complete 13-Phase Roadmap

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
- [x] **Phase 13: Production Hardening, UX Polish, Demo Mode & Final Launch Readiness** (Landing Page Hero Demo Card, Role Dashboards, One-Click Demo Reset, 4-Minute Hackathon Demo Script)

---

## ⚖️ Legal & Compliance Disclaimer

> [!IMPORTANT]
> **Hackathon MVP Notice**: ChitTrust + CashBridge is a technology platform prototype for transparent community savings group management. Actual chit fund or committee operations must comply with applicable Indian laws, regulations, and registration requirements under the **Chit Funds Act, 1982**.
