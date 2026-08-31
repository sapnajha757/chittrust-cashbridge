# ChitTrust + CashBridge 🪙🤝

> **Financial Inclusion Platform for Mixed Digital + Cash-Based Community Committees (Chit Funds / SHGs) in India**

---

## 📌 Project Overview

**ChitTrust + CashBridge** is a hackathon-ready financial inclusion platform built specifically for informal and semi-formal community savings groups (Chit Funds, ROSCAs, Self-Help Groups) across urban and rural India.

It bridges the gap between **digital-first members** (who prefer UPI/online payments) and **cash-based micro-savers** (who lack digital literacy or banking access), creating a **unified Trust Score** that treats digital and verified cash contributions with equal credit weight.

---

## 📞 Multilingual Voice IVR Subsystem (Phase 8 Completed)

For complete architecture, provider abstraction, and Hindi speech specs, see [docs/voice.md](file:///c:/Users/sapna%20jha/ChitTrust%20—%20CashBridge/docs/voice.md).

- **Feature Phone Accessibility Layer**: Allows users to dial a toll-free number and query their Trust Score and payment status via keypad digits or natural Hindi speech.
- **Single Source of Truth**: Consumes real database records directly from `TrustScoreService` and `ContributionService`.
- **Telephony Provider Abstraction**: Configurable support for `VOICE_PROVIDER=mock` (developer simulator), `twilio` (TwiML XML), and `exotel` (IVR JSON).
- **Deterministic Intent Classification**: Keyword classification (`intent_detector.py`) ensures AI models never guess financial numbers.
- **Developer Voice Simulator Portal (`/dev/voice-demo`)**: Interactive web simulator with DTMF keypad, Hindi speech chips, live transcripts, and PIN authentication.

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
- **Telephony**: Provider Abstraction (Mock, Twilio, Exotel)
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

---

## ⚖️ Legal & Compliance Disclaimer

> [!IMPORTANT]
> **Hackathon MVP Notice**: Real-world deployment requires formal compliance under India's **Chit Funds Act, 1982** and applicable state amendments.
