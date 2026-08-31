# ChitTrust + CashBridge 🪙🤝

> **Financial Inclusion Platform for Mixed Digital + Cash-Based Community Committees (Chit Funds / SHGs) in India**

---

## 📌 Project Overview

**ChitTrust + CashBridge** is a hackathon-ready financial inclusion platform built specifically for informal and semi-formal community savings groups (Chit Funds, ROSCAs, Self-Help Groups) across urban and rural India.

It bridges the gap between **digital-first members** (who prefer UPI/online payments) and **cash-based micro-savers** (who lack digital literacy or banking access), creating a **unified Trust Score** that treats digital and verified cash contributions with equal credit weight.

---

## 🎯 Problem Statement

1. **Digital Exclusion in Community Chits**: Over 60% of rural and semi-urban community savings participants prefer or depend on cash. Traditional digital fintech platforms force users to adopt UPI, excluding cash members.
2. **Trust & Accounting Gaps**: Informal cash collections by local organizers lead to disputes, lost records, and lack of audit trails.
3. **Invisible Credit History**: Cash-based micro-savers contribute reliably for years but receive zero credit score benefit because their savings remain unrecorded in formal financial credit bureaus.

---

## 💳 Digital Contributions & Razorpay Test Integration (Phase 5 Completed)

For complete payment flow diagrams, HMAC verification algorithms, and webhook idempotency specs, see [docs/payments.md](file:///c:/Users/sapna%20jha/ChitTrust%20—%20CashBridge/docs/payments.md).

- **Server-Side Order Creation (`/api/v1/contributions/upi/order`)**: Calculates amount in integer paise from `group.contribution_per_month` (client amounts strictly ignored).
- **Cryptographic Signature Verification (`/api/v1/contributions/upi/verify`)**: Validates Razorpay callback parameters using constant-time HMAC-SHA256 comparison before marking contribution `successful`.
- **Webhook Processing (`/api/v1/payments/razorpay/webhook`)**: Verified event updates and idempotency ledger (`payment_webhook_events`).
- **Receipts & Ledgers**: Payment receipts with transaction references (`PaymentReceipt`) and organizer collection ledgers (`ContributionLedger`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State & Auth**: Supabase Auth + React Auth Context (`useAuth`)
- **Payments**: Razorpay Checkout SDK (Test Mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend & Database
- **Framework**: FastAPI (Python 3.11+)
- **Payments SDK**: Razorpay Python SDK (`razorpay`)
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

## 📈 Development Roadmap & Planned Phases

- [x] **Phase 1: Project Foundation** (Tech Stack, Modular Layout, Routing, Health Check, Types, Documentation)
- [x] **Phase 2: Database Schemas, RLS Security, Triggers & Storage** (10 Tables, 9 Enums, Triggers, RLS, Storage Bucket)
- [x] **Phase 3: Authentication, Onboarding & Role-Based Access** (Phone OTP, Profile Setup, Middleware, Dashboards)
- [x] **Phase 4: Group Creation & Membership Management** (Group Setup, Digital/Cash Invites, Agent Assignment, Exited State)
- [x] **Phase 5: Digital Contributions & Razorpay Test Payments** (Razorpay Test Mode, HMAC-SHA256 Verification, Webhook Idempotency, Receipts)
- [ ] **Phase 6: CashBridge Doorstep Cash Verification Workflows**
- [ ] **Phase 7: TrustScore Calculation Engine & Auction Bidding Engine**
- [ ] **Phase 8: Groq Multilingual Voice AI Assistance for Low-Literacy Users**

---

## ⚖️ Legal & Compliance Disclaimer

> [!IMPORTANT]
> **Hackathon MVP Notice**: Real-world deployment requires formal compliance under India's **Chit Funds Act, 1982** and applicable state amendments.
